const $ = require('jquery');
var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyDtQiCxcoTg6C4sk_rDwutRtfCXeSQMSHA",
    authDomain: "klassenbuch-92827.firebaseapp.com",
    databaseURL: "https://klassenbuch-92827.firebaseio.com",
    storageBucket: "klassenbuch-92827.appspot.com",
    messagingSenderId: "924031502781"
};
firebase.initializeApp(config);
var database = firebase.database();
var cUser = null;
/**
 * CONSTANTS
 */
const refUsers = "user";
const refClass = "class";
const refStudent = refUsers + "/student/";
const refTeacher = refUsers + "/teacher/";
// const refTimetable = refClass + "/timetable/";
const refTimetable = "Timetable/teachers/";

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        cUser = user;
        updateHTML(user.email, user.displayName, user.photoURL);
    } else {
        window.location.href = "/unauthorized.html";
    }
});

/**
 * Read once from DB
 */
function getStudentPromise() {
    var ref = database.ref(refStudent + "/" + cUser.uid);
    // TODO: Error handling
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

function getAllStudentsPromise() {
    var ref = database.ref(refStudent);
    // TODO: Error handling
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

function getTimetablePromise() {
    var ref = database.ref(refTimetable);
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

function getClasslistPromise() {
    var ref = database.ref(refClass);
    return ref.once("value").then(function(data) {
        return data.val();
    });
}

function filterStudentsByClass(className) {
    return getAllStudentsPromise().then(function(data) {
        var studentsInClass = [];
        $.each(data, function(studentUID, studentSettings) {
            if (studentSettings.class === className) {
                studentsInClass.push(data);
            }
        });
        console.log(studentsInClass);
        return studentsInClass;
    });
}

function createClassDropdown(name, id, classList) {
    var dropdown_classList = $("<select></select>").attr("id", id).attr("classList_" + "name", name);
    $.each(classList, function(i, el) {
        dropdown_classList.append("<option>" + el + "</option>");
    });
    $("#setStudentClass").append(dropdown_classList);
}


function updateHTML(userEmail, userName, userProfileImageURL) {
    getClasslistPromise().then(function(data) {
        var keyList = [];
        $.each(data, function(key, val) {
            keyList.push(key);
        });
        console.log(keyList);
        createClassDropdown("classdropdown", "classdropdown", keyList);
        $.each(keyList, function(key, val) {
            createClassDropdown("studentdropdown", "studentdropdown", filterStudentsByClass(val));
        });
    });

    // // TODO: Error handling
    // getTimetablePromise().then(function(timetable) {
    //     var ele = $.parseHTML(timetable.teacher1);
    //     console.log($($(timetable.teacher1)));
    //     $('#stundenplan-placeholder').append($($(timetable.teacher1)));
    // });


    $('#user-image')[0].src = userProfileImageURL;
    $('.placeholder').each(function() {
        switch ($(this)[0].innerText) {
            case "#email#":
                $(this)[0].innerText = userEmail;
                break;
            case "#name#":
                $(this)[0].innerText = userName;
                break;
            default:
        }
    });
}

function updateProfileInfo(key, value) {
    cUser.updateProfile({
        photoURL: value
    }).then(function() {
        // console.log("Updated Profile Info");
    }, function(error) {
        // console.log("Something went wrong");
    });
}


$(document).ready(function() {
    // Sitenavigation
    $('.navbar-fixed-side ul').on('click', function(e) {
        $('.navbar-fixed-side ul .active').removeClass('active');
        $(e.target).addClass('active');
        var containerName = e.target.id.split("_")[1];
        $('.dashboard-container').removeClass('active');
        $('#' + containerName).addClass('active');
    });
    // Profile changes
    $('#save-profile-changes').on('click', function(eventInfo) {
        $('.profile-input').each(function(index) {
            switch ($(this)[0].id) {
                case 'profile-picture-url':
                    updateProfileInfo('photoURL', $(this)[0].value);
                    break;
                default:

            }
        });
    });

    // Logout
    $('#btn-logout').on('click', function() {
        firebase.auth().signOut().then(function() {
            window.location.href = "/logout-success.html"
        }, function(error) {
            // An error happened.
        });
    });


    /**
     * DEBUG OPTIONS
     */
    $('#debug_sendToDb').on('click', function() {
        for (var i = 0; i < 10; i++) {
            database.ref(refStudent + "/" + i).set({
                class: "11FI5F",
                company: "provadis",
                dateofbirth: "20.07.1993",
                instructor: "Schmidt",
                telephone: 12345678,
                type: "azubi"

            });
        }
    });
})
