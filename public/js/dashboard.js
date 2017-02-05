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
var ref = firebase.database().ref('users');
var cUser = null;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        cUser = user;
        updateLoginDate(user.uid);
        updateHTML(user.email, user.displayName, user.photoURL);
    } else {
        window.location.href = "/unauthorized.html";
    }
});


function updateLoginDate(userUID) {
    var userRef = ref.child(userUID + "/loginTimes/");
    userRef.push({
        lastLogin: Date()
    });
}

function updateHTML(userEmail, userName, userProfileImageURL) {
    console.log("update");
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
})
