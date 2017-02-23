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
            toggleLoading();
            htmlUpdate_user_username(currentUser.displayName);
            htmlUpdate_user_email(currentUser.email);
            htmlUpdate_user_profilePicture(currentUser.photoURL);
            $(function() {
                getDebugStudentPromise(currentUser.uid).then(function(studentObject) {
                    $.each(studentObject.fehlzeiten, function(key, value) {
                        var newListItem = document.createElement('li');
                        $(newListItem).addClass("missing-times-item");
                        $.each(value, function(key_1, value_1) {
                            var tempText = document.createElement('p');
                            tempText.innerText = value_1;
                            $(newListItem).append(tempText);
                        });                   
                        $('#missing-times-list').append(newListItem);
                    });
                });
            });

            $('#debug_sendToDb').on('click', function() {
                console.log(currentUser);
                forceWriteOfUserData(currentUser);
            });
            console.log("HERERE");
        } else {
            window.location.href = "/unauthorized.html";
        }
    });



    // $('#save-profile-changes').on('click', updateProfileInfo());

    // $("#select_class_list").on('change', function(eventInfo) {
    //     updateClassList(eventInfo);
    // });

    // $('#btn-logout').on('click', logout());

    console.log("DONE LOADING");

});

// ##### UPDATE HTML PLACEHOLDER #####
function htmlUpdate_user_username(userName) {
    console.log("DEBUG: Update html username: ", userName);
    $('#ph-username').innerText = userName;
}

function htmlUpdate_user_email(userEmail) {
    console.log("DEBUG: Update html email: ", userEmail);
    $('#ph-email').innerText = userEmail;
}

function htmlUpdate_user_class(userClass) {
    console.log("DEBUG: Update html class");
}

function htmlUpdate_user_profilePicture(userProfileImageURL) {
    console.log("DEBUG: Update html picture: ", userProfileImageURL);
    console.log("ImageElement: ", $('#ph-profilepicture'));
    $('#ph-profilepicture').get(0).src = userProfileImageURL;
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
    var ref = database.ref(refTimetable);
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
            // console.log("Student Settings: ", studentSettings);
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

    filterStudentsByClass("11FI5FFFFF").then(function(data) {
        console.log("Filtered studs", data);
    });
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
                }).then(function() {
                    // console.log("Updated Profile Info");
                }, function(error) {
                    // console.log("Something went wrong");
                });
                break;
            default:
        }
    });
}


function updateClassList(eventInfo) {
    $('#select_student_list').empty();
    filterStudentsByClass(eventInfo.target.value).then(function(data) {
        $.each(data, function(index) {
            console.log(data[index].name);
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
    console.log("WRITING" + Date());
    database.ref("debug/" + currentUser.uid).set({
        name: "Tobias Stosius",
        class: "bfia5f",
        teacher: "Weng",
        personalevent: {
            SVSitzung: {
                date: "20.05.2000",
                time: "08:00",
                info: "Raum D123"
            }
        },
        fehlzeiten: {
            UID_1: {
                date: "03.03.2000",
                lesson: "Stunde: 1",
                duration: "20min"
            },
            UID_2: {
                date: "03.03.2000",
                lesson: "Stunde: 3",
                duration: "20min"
            },
            UID_3: {
                date: "03.03.2000",
                lesson: "Stunde: 3",
                duration: "20min"
            },
            UID_4: {
                date: "03.03.2000",
                lesson: "Stunde: 7",
                duration: "20min"
            },
        },
        timestamp: Date()
    });
}
