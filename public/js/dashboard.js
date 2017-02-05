const $ = require('jquery');
var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyDcJQEmoQ9a-ZvCj8RnSWaMUs4OxaMz5wM",
    authDomain: "fireangular-b0f52.firebaseapp.com",
    databaseURL: "https://fireangular-b0f52.firebaseio.com",
    storageBucket: "fireangular-b0f52.appspot.com",
    messagingSenderId: "1040473595630"
};
firebase.initializeApp(config);
var ref = firebase.database().ref('users');

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        updateLoginDate(user.uid);
        updateHTML(user.email,user.displayName);
    } else {
        window.location.href = "/unauthorized.html";
    }
});


function updateLoginDate(userUID) {
    var userRef = ref.child(userUID+"/loginTimes/");
    userRef.push({
        lastLogin: Date()
    });
}

function updateHTML(userEmail,userName){
  console.log("update");
  $('.placeholder').each(function(){
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


$(document).ready(function() {
    console.log("ready; ");

    $('.navbar-fixed-side ul').on('click', function(e){
      $('.navbar-fixed-side ul .active').removeClass('active');
      $(e.target).addClass('active');
      var containerName = e.target.id.split("_")[1];
      $('.dashboard-container').removeClass('active');
      $('#'+containerName).addClass('active');
    });



    $('#btn-logout').on('click', function() {
        console.log("click");
        firebase.auth().signOut().then(function() {
            window.location.href = "/logout-success.html"
        }, function(error) {
            // An error happened.
        });
    });
})
