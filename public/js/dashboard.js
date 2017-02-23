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
const refUsers = "user";
const refClass = "class";
const refDebug = "debug";
const refStudent = refUsers + "/student/";
const refTeacher = refUsers + "/teacher/";
const refTimetable = "Timetable/teachers/";


$(document).ready(function() {
    var cUser = null;
    /**
     * Authentication state of a user changed (logged in/out)
     * @type {[type]}
     */
    firebase.auth().onAuthStateChanged(function(currentUser) {
        if (currentUser) {
            /*
            Code that sits in here will run when the user is
            successfully logged in.
            In This scope we will have the user object available
            */
            htmlUpdate_user_username(currentUser.displayName);
            htmlUpdate_user_email(currentUser.email);
            htmlUpdate_user_profilePicture(currentUser.photoURL);
            htmlUpdate_missingTimes(currentUser.uid);
            htmlUpdate_events(currentUser.uid);
            htmlUpdate_timetable();

            $('#debug_sendToDb').on('click', function() {
                forceWriteOfUserData(currentUser);
            });
            toggleLoading();
        } else {
            window.location.href = "/unauthorized.html";
        }
    });



    // $('#save-profile-changes').on('click', updateProfileInfo());

    // $("#select_class_list").on('change', function(eventInfo) {
    //     updateClassList(eventInfo);
    // });

    // $('#btn-logout').on('click', logout());
});

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
        $.each(studentObject.fehlzeiten, function(key, fehlzeiten) {
            createListItems(fehlzeiten, "missing-times-item", "#missing-times-list");
        });
    });
}

function htmlUpdate_events(currentUserUID) {
    getDebugStudentPromise(currentUserUID).then(function(studentObject) {
        $.each(studentObject.personalevent, function(key, personalevent) {
            createListItems(personalevent, "next-event-item", "#next-events-list");
        });
    });
}

function htmlUpdate_timetable() {
    getTimetablePromise().then(function(timetable) {
        $('#timetable-wrapper').html(timetable);
    });
}

function createListItems(objectList, itemClassName, appendToElementWithID) {
    console.log(Object.keys(objectList));
    var newListItem = document.createElement('li');
    $(newListItem).addClass(itemClassName);
    $.each(objectList, function(key, value) {
        var tempText = document.createElement('p');

        if (key == "status" && value == "pending") {
            $(newListItem).addClass("pending");
        } else if (key == "status" && value == "approved") {
            $(newListItem).addClass("approved");
        } else {
            tempText.innerText = value;
            $(newListItem).append(tempText);
        }
    });
    $(appendToElementWithID).append(newListItem);
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
function getStudentPromise(userUID) {
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

/**
 * Update HTML placeholder with profile image
 * @param  {string} userImageURL Profileimage URL
 * @return {null}              Nothing
 */
function displayProfileImage(userImageURL) {
  $('#profile-image-placeholder')[0].src = userImageURL;
}
/**
 * Update HTML placeholder with profile name
 * @param  {string} userName Name of the logged in user
 * @return {null}          Nothing
 */
function displayProfileName(userName) {
  $('#placeholder_usename')[0].innerText = userName;
}
/**
 * Update HTML placeholder with profile email
 * @param  {string} userEmail Email of the logged in user
 * @return {null}           Nothing
 */
function displayProfileEmail(userEmail){
  console.log("Set Email",userEmail);
  $('#placeholder_email')[0].innerText = userEmail;
}

function displayProfileClass() {
  getStudentPromise().then(function(data){
    console.log(data);
  })
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
                status: "approved"
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
