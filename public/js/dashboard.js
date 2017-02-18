/*
  Require external code
 */
const $ = require('jquery');
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
        updateHTML(user.email, user.displayName, user.photoURL);
    } else {
        window.location.href = "/unauthorized.html";
    }
});

/**
 * Lookup certain student
 * @return {promise} Student object as promise
 */
function getStudentPromise() {
    var ref = database.ref(refStudent + "/" + cUser.uid);
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

function toggleLoading() {
  $('#loadingCircle').toggleClass('loading');
  $('#contentWrapper').toggleClass('loading');
}


function updateHTML(userEmail, userName, userProfileImageURL) {

    getClasslistPromise().then(function(data){
      $.each(Object.keys(data), function(counter){
        $("#select_class_list").append("<option>" + Object.keys(data)[counter] + "</option>");
      });
    });

    filterStudentsByClass("11FI5FFFFF").then(function(data){
      console.log("Filtered studs",data);
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
    cUser.updateProfile({
        photoURL: value
    }).then(function() {
        // console.log("Updated Profile Info");
    }, function(error) {
        // console.log("Something went wrong");
    });
}

function switchNavigationTab(eventInfo) {
  $('.navbar-fixed-side ul .active').removeClass('active');
  $(clickedElement.target).addClass('active');
  $('.dashboard-container').removeClass('active');
  clickedElement.target.id.split("_")[1].addClass('active');
}

$(document).ready(function() {
  toggleLoading();

    $('.navbar-fixed-side ul').on('click', function(eventInfo){
      switchNavigationTab(eventInfo)
    });

    // // Profile changes
    // $('#save-profile-changes').on('click', function(eventInfo) {
    //     $('.profile-input').each(function(index) {
    //         switch ($(this)[0].id) {
    //             case 'profile-picture-url':
    //                 updateProfileInfo('photoURL', $(this)[0].value);
    //                 break;
    //             default:
    //
    //         }
    //     });
    // });

    // $("#select_class_list").on('change',function(event){
    //   console.log("clear list");
    //   $('#select_student_list').empty();
    //   filterStudentsByClass(event.target.value).then(function(data){
    //       $.each(data,function(index){
    //         console.log(data[index].name);
    //         $('#select_student_list').append('<option>'+data[index].name+'</option>')
    //       });
    //   });
    // });

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
      toggleLoading();
    });
})
