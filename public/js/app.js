const $ = require('jquery');
var firebase = require('firebase');
var firebaseui = require('firebaseui');


var config = {
    apiKey: "AIzaSyDtQiCxcoTg6C4sk_rDwutRtfCXeSQMSHA",
    authDomain: "klassenbuch-92827.firebaseapp.com",
    databaseURL: "https://klassenbuch-92827.firebaseio.com",
    storageBucket: "klassenbuch-92827.appspot.com",
    messagingSenderId: "924031502781"
};
firebase.initializeApp(config);
document.cookie="useruid=''";
$(document).ready(function() {
    $('#login-google').on('click', function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        firebase.auth().signInWithPopup(provider).then(function(result) {
            var token = result.credential.accessToken;
            console.log(result.user);

            document.cookie="useruid="+result.user.uid;
            document.cookie="userphotourl="+result.user.photoURL;
            document.cookie="useremail="+result.user.email;
            document.cookie="userdisplayname="+result.user.displayName;

            window.location = "dashboard.html";
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            console.log(error);
        });
    });
});
