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
const refStudent = refUsers + "/student/";
const refTeacher = refUsers + "/teacher/";

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
  var ref = database.ref(refStudent);
    return ref.once("value").then(function(data) {
        return data.val();
    });
}


function updateHTML(userEmail, userName, userProfileImageURL) {
    getStudentPromise().then(function(student){
      console.log(student);
    });
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
    console.log(key + " : " + value);
    console.log(cUser);
    cUser.updateProfile({
        photoURL: value
    }).then(function() {
        console.log("Updated Profile Info");
    }, function(error) {
        console.log("Something went wrong");
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
            console.log($(this)[0].id);
            console.log($(this)[0].value);
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
        console.log("click");
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
        database.ref(refStudent + "/" + cUser.uid).set({
            isFirst: "true"
        });
    });
})
