/*
  Require external code
 */
var $ = global.jQuery = require('jquery');
var bootstrap = require('bootstrap-sass');
var firebase = require('firebase');
var dateformat = require('dateformat');
var htmlHelper = require('./htmlHelper.js');
var databaseHelper = require('./databaseHelper.js');

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
        console.log("Update color");
        updateHTML_sidebarColor(sidebarColorClass);
      }
      // Restore content background color
      var contentColorClass = checkCookieForKey("contentColor");
      if (contentColorClass) {
        updateHTML_contentColor(contentColorClass);
      }

      // Passed to function
      // database Path, ID of list to update, options
      updateListOnValueChange(refDebug + '/' + currentUser.uid + '/fehlzeiten', $('.list-missing-times-small'), {
        showDescription: false,
        addEventlistener: false,
        className: 'missing-times-item'
      });
      updateListOnValueChange(refDebug + '/' + currentUser.uid + '/fehlzeiten', $('.list-missing-times-large'), {
        showDescription: true,
        addEventlistener: true,
        className: 'missing-times-item'
      });
      updateListOnValueChange(refDebug + '/' + currentUser.uid + '/personalevent', $('.list-events-small'), {
        showDescription: false,
        addEventlistener: false,
        className: 'next-event-item'
      });
      updateListOnValueChange(refDebug + '/' + currentUser.uid + '/personalevent', $('.list-events-large'), {
        showDescription: true,
        addEventlistener: true,
        className: 'next-event-item'
      });

      $('#debug_sendToDb').on('click', function() {
        forceWriteOfUserData(currentUser);
      });
      $('#btn-excuses').on('click', function() {
        $.each($('.selected'), function() {
          setExcuse(currentUser.uid, $(this).get(0).id, $('#missing-time-excuse').get(0).value);
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
      $('#create-new-missing-time').on('click', function() {
        var missingTimeDate = $('#missing-time-date').get(0).value;
        missingTimeDate = dateformat(missingTimeDate, 'dd.mmm.yyyy');
        console.log(missingTimeDate);
        var missingTimeDuration = $('#missing-time-duration').get(0).value;
        var missingTimeDescription = $('#missing-time-excuse').get(0).value;
        var missingTimeLesson = $('#missing-time-lesson').get(0).value;
        missingTimeDuration = missingTimeDuration + ' ' + $('#missing-time-duration-format').get(0).value;
        if (missingTimeDate !== "" && missingTimeDuration !== "") {
          var UID = Date.now();
          var tmpRef = refDebug + '/' + currentUser.uid + '/fehlzeiten/' + UID + '/';
          databaseHelper.write(database, tmpRef, {
            date: missingTimeDate,
            lesson: "Stunde: " + missingTimeLesson,
            duration: missingTimeDuration,
            status: 'pending',
            description: missingTimeDescription
          });
        } else {
          displayModal('error', 'Ein Fehler ist aufgetreten', 'Es werden ein Datum und eine Zeitangabe benötigt');
        }
      });
      $('#close-modal').on('click', function() {
        $('#universal-modal').fadeOut('fast');
        $('.page-overlay').fadeOut('fast');
      });

      databaseHelper.getStudentPromise(database, 'user/student/').then(function(students) {
        $.each(students, function(userID, userInformations) {
            console.log("Creating list");
          htmlHelper.searchList({
            [userInformations.class]: userInformations.name
          }, 'test', $('#search-list-student'));
        });
        console.log("Init search");
        search();
        SearchOnList.init($('[data-behaviour=search-on-list]'));
      });

      toggleLoading();



    } else {
      window.location.href = "/unauthorized.html";
    }
  }); // AUTH END
}); // DOCUMENT READY END

function updateListOnValueChange(refPath, listObject, options) {
  database.ref(refPath).on('value', function(snapShot) {
    $.each(listObject, function(counter, list) {
      $(list).children().remove();
      $.each(snapShot.val(), function(key, value) {
        htmlHelper.updateList(value, options.className, $(list), {
          showDescription: options.showDescription,
          addEventlistener: options.addEventlistener,
          appendID: key
        });
      });
    });
  });
}

function checkCookieForKey(searchedValue) {
  var foundValue = null;
  var cookieSplit = document.cookie.split(";");
  $.each(cookieSplit, function(key, value) {
    if (cookieSplit[key].indexOf(searchedValue) >= 0) {
      foundValue = cookieSplit[key].split("=")[1];
    }
  });
  return foundValue;
}
// ##### UPDATE HTML PLACEHOLDER #####
function htmlUpdate_user_username(userName) {
  $('#ph-username').get(0).innerText = userName;
}

function htmlUpdate_user_email(userEmail) {
  $('#ph-email').get(0).innerText = userEmail;
}

function htmlUpdate_user_profilePicture(userProfileImageURL) {
  $('#ph-profilepicture').get(0).src = userProfileImageURL;
}
// #### FILL DASHBOARD ELEMENTS ####
function updateHTML_sidebarColor(colorclass) {
  $('.tab-content').attr('class',
    function(i, c) {
      return c.replace(/(^|\s)color-\S+/g, ' ' + colorclass);
    });
  document.cookie = "sidebarColor=" + colorclass;
}

function updateHTML_contentColor(colorclass) {
  $('.content-wrapper').attr('class',
    function(i, c) {
      return c.replace(/(^|\s)color-\S+/g, ' ' + colorclass);
    });
  document.cookie = "contentColor=" + colorclass;
}

function htmlUpdate_timetable() {
  databaseHelper.getTimetablePromise(database, refTimetable).then(function(timetable) {
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
function getStudentPromise(userUID) {
  var ref = database.ref(refDebug + "/" + userUID);
  // TODO: Error handling
  return ref.once("value").then(function(data) {
    return data.val();
  });
}

// /**
//  * Lookup all Students
//  * @return {promise} All Students in the DB
//  */
// function getAllStudentsPromise() {
//     var ref = database.ref(refStudent);
//     // TODO: Error handling
//     return ref.once("value").then(function(data) {
//         return data.val();
//     });
// }

/**
 * Retrive the timetable
 * @return {promise} A certain timetable as promise
 */
// function getTimetablePromise() {
//     var ref = database.ref(refDebug + "/stundenplan");
//     return ref.once("value").then(function(data) {
//         return data.val();
//     });
// }

/**
 * Retrive all classes
 * @return {promise} A list of all classes
 */
// function getClasslistPromise() {
//     var ref = database.ref(refClass);
//     return ref.once("value").then(function(data) {
//         return data.val();
//     });
// }

/**
 * Get all students from the provided classname
 * @param  {string} className Name of the class
 * @return {array}           All Students that are in the provided class
 */
function filterStudentsByClass(className) {
  return databaseHelper.getAllStudentsPromise(database, refClasslist).then(function(data) {
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
function displayProfileEmail(userEmail) {
  $('#placeholder_email')[0].innerText = userEmail;
}

function displayProfileClass() {
  getStudentPromise().then(function(data) {});
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
      $('#select_student_list').append('<option>' + data[index].name + '</option>');
    });
  });
}

/**
 * Display notification with state and tetx
 * @param  {string} state error,hint,success
 * @param  {string} title Large message to display
 * @param  {string} text  Further information
 * @return {null}       Nothing to return
 */
function displayModal(state, title, text) {
  $('#modal-headline').get(0).innerText = title;
  $('#modal-text').get(0).innerText = text;
  // Remove exsisting classes
  $('#universal-modal').removeClass('success');
  $('#universal-modal').removeClass('hint');
  $('#universal-modal').removeClass('error');
  // Set modal color based on notification type
  $('#universal-modal').addClass(state);
  // Display modal and background
  $('#universal-modal').fadeIn('fast');
  $('.page-overlay').fadeIn('fast');
}


function logout() {
  firebase.auth().signOut().then(function() {
    window.location.href = "/logout-success.html";
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


////////////////// FANCY SHIT //////////////////

////// Credit goes to:
////// https://codepen.io/davilious/pen/YqdoyP?editors=1010
function search() {
  // TODO: be more elegant here
  function format(text) {
    return text.replace(/ /g, '').replace(/(<([^>]+)>)/ig, '').toLowerCase();
  }

  var SearchOnList = {
    $LIST: '[data-search-on-list=list]',
    $SEARCH: '[data-search-on-list=search]',
    $LIST_ITEM: '[data-search-on-list=list-item]',
    $COUNTER: '[data-search-on-list=counter]',
    TEMPLATE_EMTPY: '<li class="list-item list-item--disable">No results found</li>',


    init: function($element) {
      this.items = [];
      this.itemsMatched = [];

      this.$element = $element;
      this.$list = this.$element.find(this.$LIST);
      this.$search = this.$element.find(this.$SEARCH);
      this.$counter = this.$element.find(this.$COUNTER);

      this.items = this._getAllItems();
      this.itemsMatched = this.items;

      this._updateCounter();
      this._handleResults();
      this._setEventListeners();
    },

    _setEventListeners: function() {
      this.$search
        .on('keyup', $.proxy(this._onKeyup, this))
        .on('query:changed', $.proxy(this._handleQueryChanged, this))
        .on('query:results:some', $.proxy(this._handleResults, this))
        .on('query:results:none', $.proxy(this._handleNoResults, this))
    },

    _onKeyup: function() {
      var query = this.$search.val(),
        previousQuery = this.$search.data('previousQuery', query);

      // TODO: Decide when query actually changed
      if (this._queryChanged()) {
        this.$search.trigger('query:changed', {
          query: query,
          previousQuery: previousQuery
        });
      }
    },

    _queryChanged: function() {
      var query = this.$search.val();
      if ($.trim(query).length === 0 && this.$search.data('previousQuery') === undefined) {
        return false;
      }
      return true;
    },

    _handleQueryChanged: function(e, data) {
      this.itemsMatched = this.items.map(function(item) {
        if (format(item.name).match(format(data.query))) {
          return {
            name: item.name,
            visible: true
          }
        }
        return {
          name: item.name,
          visible: false
        }
      });

      this._render();
      this._updateCounter();
    },

    _handleNoResults: function() {
      this.$list.html(this.TEMPLATE_EMTPY);
    },

    _handleResults: function() {
      this.$list.empty().append(this._renderItemsVisible())
    },

    _someItemsVisible: function() {
      return this.itemsMatched.some(function(item) {
        return item.visible;
      });
    },

    _render: function() {
      (this._someItemsVisible()) ?
      this.$search.trigger('query:results:some'):
        this.$search.trigger('query:results:none');
    },

    _updateCounter: function() {
      (this._someItemsVisible()) ?
      this.$counter.text(this._renderItemsVisible().length):
        this.$counter.text('');
    },

    _getAllItems: function() {
      var $items = this.$list.find(this.$LIST_ITEM);

      return $items.map(function() {
        var $item = $(this);

        return {
          name: $item.html(),
          visible: true
        };
      }).toArray();
    },

    _renderItemsVisible: function() {
      var itemInTemplate;
      return this.itemsMatched.sort(function(a, b) {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1;
        return 0;
      }).reduce(function(items, item) {
        itemInTemplate = '<li class="list-item" data-search-on-list="list-item">' + item.name + '</li>';
        if (item.visible) {
          items.push(itemInTemplate);
        }
        return items;
      }, []);
    }
  };

  window.SearchOnList = SearchOnList;
};
