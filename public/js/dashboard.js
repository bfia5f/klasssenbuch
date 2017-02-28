/*
  Require external code
 */
var $ = global.jQuery = require('jquery');
var bootstrap = require('bootstrap-sass');
var firebase = require('firebase');
/*
  Init Firebase
 */
var config = {
    apiKey: "AIzaSyDtQiCxcoTg6C4sk_rDwutRtfCXeSQMSHA",
    authDomain: "klassenbuch-92827.firebaseapp.com",
    databaseURL: "https://klassenbuch-92827.firebaseio.com",
    storageBucket: "klassenbuch-92827.appspot.com",
    messagingSenderId: "924031502781"
};
firebase.initializeApp(config);
/*
  Variables
 */
var database = firebase.database();

/*
  Paths to DB 'objects'
 */
var refUsers = "user";
var refClass = "class";
var refDebug = "debug";
var refStudent = refUsers + "/student/";
var refTeacher = refUsers + "/teacher/";
var refTimetable = "Timetable/teachers/";

var cUser = null;

$(document).ready(function() {

    var DISPLAYNAME = getCookieValue('userdisplayname');
    var EMAIL = getCookieValue('useremail');
    var UID = getCookieValue('useruid');
    var PHOTOURL = getCookieValue('userphotourl');

    htmlUpdate_user_username(DISPLAYNAME);
    htmlUpdate_user_email(EMAIL);
    htmlUpdate_user_profilePicture(PHOTOURL);
    htmlUpdate_missingTimes(UID);
    htmlUpdate_events(UID);
    htmlUpdate_timetable();
    console.log(UID);
    database.ref(refDebug + '/' + UID + '/fehlzeiten').on('value', function(snapshot) {
        console.log(snapshot.val());
        $('#missing-times-list-large').children().remove();
        $.each(snapshot.val(), function(key,value) {
            createListItems(value, "missing-times-item", "#missing-times-list-large", {
                showReason: true,
                addEventlistener: true,
                appendID: "myid"
            });
        });
    });


    firebase.auth().onAuthStateChanged(function(currentUser) {
        if (currentUser) {
            document.cookie = "useruid=" + currentUser.uid;
            document.cookie = "userphotourl=" + currentUser.photoURL;
            document.cookie = "useremail=" + currentUser.email;
            document.cookie = "userdisplayname=" + currentUser.displayName;
            $('#debug_sendToDb').on('click', function() {
                forceWriteOfUserData(currentUser);
            });
        } else {
            document.cookie = "useruid=''";
            document.cookie = "userphotourl=''";
            document.cookie = "useremail=''";
            document.cookie = "userdisplayname=''";
            window.location.href = "/unauthorized.html";
        }
    });

    $('#btn-excuses').on('click', function(eventInfo) {
        $.each($('.selected'), function(element) {
            setExcuse(UID, $(this).get(0).id, $('#radio-excuses-wrapper input:checked').get(0).value);
        });
    });
    $('#logout').on('click', function() {
        firebase.auth().signOut().then(function() {
            window.location = "index.html";
            document.cookie = "useruid=''";
            document.cookie = "userphotourl=''";
            document.cookie = "useremail=''";
            document.cookie = "userdisplayname=''";
        });
    });
    toggleLoading();
});

function getCookieValue(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}


// ##### UPDATE HTML PLACEHOLDER #####
function htmlUpdate_user_username(userName) {
    $('#ph-username').innerText = userName;
}

function htmlUpdate_user_email(userEmail) {
    $('#ph-email').innerText = userEmail;
}

function htmlUpdate_user_class(userClass) {}

function htmlUpdate_user_profilePicture(userProfileImageURL) {
    $('#ph-profilepicture').get(0).src = userProfileImageURL;
}
// #### FILL DASHBOARD ELEMENTS ####
function htmlUpdate_missingTimes(currentUserUID) {
    getDebugStudentPromise(currentUserUID).then(function(studentObject) {
        console.log(studentObject.fehlzeiten);
        $.each(studentObject.fehlzeiten, function(key, fehlzeiten) {
            createListItems(fehlzeiten, "missing-times-item", "#missing-times-list", {
                showReason: false,
                addEventlistener: false,
            });
            createListItems(fehlzeiten, "missing-times-item", "#missing-times-list-large", {
                showReason: true,
                addEventlistener: true,
                appendID: key
            });
        });
    });
}

function htmlUpdate_events(currentUserUID) {
    getDebugStudentPromise(currentUserUID).then(function(studentObject) {
        $.each(studentObject.personalevent, function(key, personalevent) {
            createListItems(personalevent, "next-event-item", "#next-events-list", {
                showReason: false,
                addEventlistener: false
            });
        });
    });
}

function htmlUpdate_timetable() {
    getTimetablePromise().then(function(timetable) {
        $('#timetable-wrapper').html(timetable);
    });
}

function setExcuse(userUID, elementID, reason) {
    database.ref(refDebug + '/' + userUID + '/fehlzeiten/' + elementID).update({
        reason: reason,
        status: "approved"
    });
}

function appendEventListenerToListitem(item, listener) {
    switch (listener) {
        case "mouse":
            $(item)
                .mouseenter(function() {
                    $(item).addClass("hover");
                }).mouseleave(function() {
                    $(item).removeClass("hover");
                });
            break;
        case "click":
            $(item).on('click', function() {
                $(item).toggleClass('selected');
            });
            break;

        default:

    }
}

function createListItems(objectList, itemClassName, appendToElementWithID, options) {
    var newListItem = document.createElement('li');
    if (options.appendID) {
        $(newListItem).attr('id', options.appendID);
    }
    $(newListItem).addClass(itemClassName);

    $.each(objectList, function(key, value) {
        if (value == "pending") {
            $(newListItem).addClass("pending");
        } else if (value == "approved") {
            $(newListItem).addClass("approved");
        }
        if (options.showReason && key == "reason" || key != "reason" && key != "status") {
            var tempText = document.createElement('p');
            tempText.innerText = value;
            $(newListItem).append(tempText);
        }
    });
    $(appendToElementWithID).append(newListItem);
    if (options.addEventlistener) {
        appendEventListenerToListitem(newListItem, 'click');
        appendEventListenerToListitem(newListItem, 'mouse');
    }
}

/**
 * Show/Hide loading screen
 * @return {null} Nothing gets returned
 */
function toggleLoading() {
    $('#loadingCircle').toggleClass('loading');
    $('.page-wrapper').toggleClass('loading');
}

/**
 * Get certain user as prommise
 @param {string} userUID UID of the user to lookup
 */
function getStudentPromise(userUID) {

    var ref = database.ref(refStudent + "/" + userUID);
    // TODO: Error handling
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

/**
 * Get certain user as prommise from debug
 @param {string} userUID UID of the user to lookup
 */
function getDebugStudentPromise(userUID) {
    var ref = database.ref(refDebug + "/" + userUID);
    // TODO: Error handling
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

/**
 * Lookup all Students
 * @return {promise} All Students in the DB
 */
function getAllStudentsPromise() {
    var ref = database.ref(refStudent);
    // TODO: Error handling
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

/**
 * Retrive the timetable
 * @return {promise} A certain timetable as promise
 */
function getTimetablePromise() {
    var ref = database.ref(refDebug + "/stundenplan");
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

/**
 * Retrive all classes
 * @return {promise} A list of all classes
 */
function getClasslistPromise() {
    var ref = database.ref(refClass);
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

/**
 * Get all students from the provided classname
 * @param  {string} className Name of the class
 * @return {array}           All Students that are in the provided class
 */
function filterStudentsByClass(className) {
    return getAllStudentsPromise().then(function(data) {
        var studentsInClass = [];
        $.each(data, function(studentUID, studentSettings) {
            if (studentSettings.class === className) {
                studentsInClass.push(this);
            }
        });
        return studentsInClass;
    });
}

/**
 * Dropdown containing all classes
 * @param  {string} name      Name attribute of the HTML Element
 * @param  {string} id        ID of the HTML Element
 * @param  {array} classList List of all classes
 * @return {null}           This won't return anything
 */
function createClassDropdown(name, id, classList) {
    var dropdown_classList = $("<select></select>").attr("id", id).attr("classList_" + "name", name);
    $.each(classList, function(i, el) {
        dropdown_classList.append("<option>" + el + "</option>");
    });
    $("#setStudentClass").append(dropdown_classList);
}




function updateHTML(userEmail, userName, userProfileImageURL) {
    getClasslistPromise().then(function(data) {
        $.each(Object.keys(data), function(counter) {
            $("#select_class_list").append("<option>" + Object.keys(data)[counter] + "</option>");
        });
    });

    filterStudentsByClass("11FI5FFFFF").then(function(data) {});
}

/**
 * Update user info
 * @param  {string} key   what is beeing set
 * @param  {string} value The new value
 * @return {null}       Nothing gets returned
 */
function updateProfileInfo(key, value) {
    $('.profile-input').each(function(index) {
        switch ($(this)[0].id) {
            case 'profile-picture-url':
                cUser.updateProfile({
                    photoURL: $(this)[0].value
                }).then(function() {}, function(error) {});
                break;
            default:
        }
    });
}


function updateClassList(eventInfo) {
    $('#select_student_list').empty();
    filterStudentsByClass(eventInfo.target.value).then(function(data) {
        $.each(data, function(index) {
            $('#select_student_list').append('<option>' + data[index].name + '</option>')
        });
    });
}


function logout() {
    firebase.auth().signOut().then(function() {
        window.location.href = "/logout-success.html"
    }, function(error) {
        // An error happened.
    });
}

/**
 * Only use this for debug purposes
 */
function forceWriteOfUserData(currentUser) {
    database.ref("debug/" + currentUser.uid).set({
        name: "Tobias Stosius",
        class: "bfia5f",
        teacher: "Weng",
        personalevent: {
            SVSitzung: {
                date: "20.05.2000",
                time: "08:00",
                info: "Raum D123",
                description: "SV-Sitzung"
            }
        },
        fehlzeiten: {
            UID_1: {
                date: "03.03.2000",
                lesson: "Stunde: 1",
                duration: "20min",
                status: "pending"
            },
            UID_2: {
                date: "03.03.2000",
                lesson: "Stunde: 3",
                duration: "20min",
                status: "approved",
                reason: "Wecker nicht geklingelt"
            },
            UID_3: {
                date: "03.03.2000",
                lesson: "Stunde: 3",
                duration: "20min",
                status: "pending"
            },
            UID_4: {
                date: "03.03.2000",
                lesson: "Stunde: 7",
                duration: "20min",
                status: "pending"
            },
        },
        timestamp: Date()
    });
}
