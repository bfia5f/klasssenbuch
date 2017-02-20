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
var cUser = null;
/*
  Paths to DB 'objects'
 */
const refUsers = "user";
const refClass = "class";
const refStudent = refUsers + "/student/";
const refTeacher = refUsers + "/teacher/";
const refTimetable = "Timetable/teachers/";

/**
 * Authentication state of a user changed (logged in/out)
 * @type {[type]}
 */
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        cUser = user;
        console.log("User has been set");
        displayProfileImage(cUser.photoURL)
        displayProfileName(cUser.displayName);
        displayProfileEmail(cUser.email);
        displayProfileClass();
    } else {
        window.location.href = "/unauthorized.html";
    }
});

/**
 * Show/Hide loading screen
 * @return {null} Nothing gets returned
 */
function toggleLoading() {
    $('#loadingCircle').toggleClass('loading');
    $('#contentWrapper').toggleClass('loading');
}

/**
 * Lookup certain student
 * @return {promise} Student object as promise
 */
function getStudentPromise() {
  console.log('Find student with UID: ' + cUser.uid);
    var ref = database.ref  + "/" + cUser.uid);
    // TODO: Error handling
    var userPromise =  ref.once("value");
    userPromise.then(dataSnapshot){
      console.log('Success',dataSnapshot.val());
    };
    userPromise.catch(){
      console.log('Failure');
    }
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

$(document).ready(function() {
  console.log(cUser);
    toggleLoading();
    // displayProfileImage(cUser.photoURL)
    // displayProfileName(cUser.displayName);
    // displayProfileEmail(cUser.email);
    $('#btn-debug').on('click',function(){
      console.log('clicked');
      displayUserProfileImage(cUser.photoURL);
    });
    // $('#save-profile-changes').on('click', updateProfileInfo());

    // $("#select_class_list").on('change', function(eventInfo) {
    //     updateClassList(eventInfo);
    // });

    // $('#btn-logout').on('click', logout());

    // $('#debug_sendToDb').on('click', function() {
    //     toggleLoading();
    // });
})
