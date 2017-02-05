const $ = require('jquery');
var firebase = require('firebase');
var firebaseui = require('firebaseui');


var config = {
    apiKey: "AIzaSyDcJQEmoQ9a-ZvCj8RnSWaMUs4OxaMz5wM",
    authDomain: "fireangular-b0f52.firebaseapp.com",
    databaseURL: "https://fireangular-b0f52.firebaseio.com",
    storageBucket: "fireangular-b0f52.appspot.com",
    messagingSenderId: "1040473595630"
};
firebase.initializeApp(config);

var uiConfig = {
    signInSuccessUrl: 'dashboard.html',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
