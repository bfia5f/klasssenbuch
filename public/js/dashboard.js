/*
  Require external code
 */
var $ = global.jQuery = require('jquery');
var bootstrap = require('bootstrap-sass');
var firebase = require('firebase');
var htmlHelper = require('./htmlHelper.js');
// var eventLogik = require('./events.js');

/*
  Init Firebase
 */

// console.log(eventLogik.test());
// console.log(htmlHelper.test());
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
            htmlUpdate_timetable();

            // Restore set sidebar color
            var sidebarColorClass = checkCookieForKey("sidebarColor");
            if (sidebarColorClass) {
              updateHTML_sidebarColor(sidebarColorClass);
            }
            // Restore content background color
            var contentColorClass = checkCookieForKey("contentColor");
            if (contentColorClass) {
              updateHTML_contentColor(contentColorClass);
            }

            // Passed to function
            // database Path, ID of list to update, options
            updateListOnValueChange(refDebug + '/' + currentUser.uid + '/fehlzeiten', '#missing-times-list', {
                showDescription: false,
                addEventlistener: false,
                className: 'missing-times-item'
            });
            updateListOnValueChange(refDebug + '/' + currentUser.uid + '/fehlzeiten', '#missing-times-list-large', {
                showDescription: true,
                addEventlistener: true,
                className: 'missing-times-item'
            });
            updateListOnValueChange(refDebug + '/' + currentUser.uid + '/personalevent', '#next-events-list', {
                showDescription: false,
                addEventlistener: false,
                className: 'next-event-item'
            });

            $('#debug_sendToDb').on('click', function() {
                forceWriteOfUserData(currentUser);
            });
            $('#btn-excuses').on('click', function() {
                $.each($('.selected'), function() {
                    setExcuse(currentUser.uid, $(this).get(0).id, $('#radio-excuses-wrapper input:checked').get(0).value);
                });
            });
            $('#btn-unsetexcuses').on('click', function() {
                $.each($('.selected'), function() {
                    unsetExcuse(currentUser.uid, $(this).get(0).id);
                });
            });
            $('.color-sidebar').on('click', function() {
              sidebarColorClass = $(this).get(0).classList[1];
                updateHTML_sidebarColor(sidebarColorClass);
            });
            $('.color-content').on('click', function() {
              contentColorClass = $(this).get(0).classList[1];
                updateHTML_contentColor(contentColorClass);
            });
            $('#create-new-missing-time').on('click', function(){
                var missingTimeDate = $('#missing-time-date').get(0).value;
                var missingTimeDuration = $('#missing-time-duration').get(0).value;
                console.log("Missing Time Date: ", missingTimeDate);
                console.log("Missing Time Duration: ", missingTimeDuration);
            });


            toggleLoading();
        } else {
            window.location.href = "/unauthorized.html";
        }
    }); // AUTH END
}); // DOCUMENT READY END

function updateListOnValueChange(refPath, listID, options) {
    database.ref(refPath).on('value', function(snapShot) {
        $(listID).children().remove();
        $.each(snapShot.val(), function(key, value) {
            htmlHelper.updateList(value, options.className, listID, {
                showDescription: options.showDescription,
                addEventlistener: options.addEventlistener,
                appendID: key
            });
        });
    });
}

function checkCookieForKey(searchedValue) {
  var foundValue = null;
  var cookieSplit = document.cookie.split(";");
  $.each(cookieSplit, function(key, value){
    if (cookieSplit[key].indexOf(searchedValue) > 0) {
      foundValue =  cookieSplit[key].split("=")[1];
    }
  });
  return foundValue;
}
// ##### UPDATE HTML PLACEHOLDER #####
function htmlUpdate_user_username(userName) {
    $('#ph-username').innerText = userName;
}

function htmlUpdate_user_email(userEmail) {
    $('#ph-email').innerText = userEmail;
}

function htmlUpdate_user_profilePicture(userProfileImageURL) {
    $('#ph-profilepicture').get(0).src = userProfileImageURL;
}
// #### FILL DASHBOARD ELEMENTS ####
function updateHTML_sidebarColor(colorclass){
  $('.navbar-fixed-side').attr('class',
      function(i, c) {
          return c.replace(/(^|\s)color-\S+/g, ' '+colorclass);
      });
  document.cookie = "sidebarColor=" + colorclass;
}
function updateHTML_contentColor(colorclass){
  $('.content-wrapper').attr('class',
      function(i, c) {
          return c.replace(/(^|\s)color-\S+/g, ' '+colorclass);
      });
  document.cookie = "contentColor=" + colorclass;
}

function htmlUpdate_timetable() {
    getTimetablePromise().then(function(timetable) {
        $('#timetable-wrapper').html(timetable);
    });
}

function setExcuse(userUID, elementID, description) {
    database.ref(refDebug + '/' + userUID + '/fehlzeiten/' + elementID).update({
        description: description,
        status: "approved"
    });
}

function unsetExcuse(userUID, elementID) {
    database.ref(refDebug + '/' + userUID + '/fehlzeiten/' + elementID).update({
        description: "",
        status: "pending"
    });
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
            },
            SVSitzung2: {
                date: "01.05.2001",
                time: "10:30",
                info: "Raum D122",
                description: "SV-Sitzung-2"
            },
            SVSitzung3: {
                date: "24.06.2023",
                time: "09:45",
                info: "Raum B123",
                description: "SV-Sitzung-3"
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
                description: "Wecker nicht geklingelt"
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
