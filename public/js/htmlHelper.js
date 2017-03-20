let $ = global.jQuery = require('jquery');
module.exports = {
  updateText: function(elementSelector, value) {
    $(elementSelector).innerText = value;
  },
  updateImage: function(elementSelector, value) {
    $(elementSelector).get(0).src = value;
  },
  updateList: function(itemInformation, itemClass, parentElement, options) {
    createItemlist(itemInformation, itemClass, parentElement, options);
  },
  searchList: function(itemInformation, itemClass, parentElement, options) {
    createSearchList(itemInformation, itemClass, parentElement, options);
  },
  updateColor: function(elementSelector, value) {

  },
  displaySingleStudent: function(studentObject) {
    // Create DOM Elements
    var headline = document.createElement('h2');
    var headlineText = document.createTextNode(studentObject.name);
    $(headline).append(headlineText);
    $('#stundent-infos').append(headline);
  }
};


/**
 * @param  {Json}       itemInformation     Single line informations
 * @param  {String}     itemClass           Classname to append
 * @param  {Element}    parentElement       Where to append the li
 * @param  {Json}       options             Append listener etc.
 * @return {null} Element will be appendet directly
 */
function createItemlist(itemInformation, itemClass, parentElement, options) {
  let newListItem = document.createElement('li');
  $(newListItem).addClass(itemClass);

  if (options.appendID) {
    $(newListItem).attr('id', options.appendID);
  }
  if (options.addEventlistener) {
    appendEventListenerToListitem(newListItem, 'click');
    appendEventListenerToListitem(newListItem, 'mouse');
  }

  $.each(itemInformation, function(key, value) {
    if (value == 'pending') {
      $(newListItem).addClass('pending');
    } else if (value == 'approved') {
      $(newListItem).addClass('approved');
    }
    if (options.showDescription && key == 'description' || key != 'description' && key != 'status') {
      let tempText = document.createElement('p');
      tempText.innerText = value;
      $(newListItem).append(tempText);
    }
  });
  $(parentElement).append(newListItem);
}

function createSearchList(itemInformation, itemClass, parentElement, options) {
  /*
  <li class="list-item" data-search-on-list="list-item">
    <a href="" class="list-item-link">Ali <span class="item-list-subtext">Smith</span></a>
  </li>
   */

  var newListItem = document.createElement('li');
  $(newListItem).addClass('list-item');
  $(newListItem).addClass(itemClass);
  $(newListItem).attr('data-search-on-list', 'list-item');

  if (options && options.appendID) {
    $(newListItem).attr('id', options.appendID);
  }

  $.each(itemInformation, function(key, value) {
    var innerItem = document.createElement('a');
    $(innerItem).addClass('list-item-link');
    
    var subInnerItem = document.createElement('span');
    $(subInnerItem).addClass('item-list-subtext');

    var innerItemText = document.createElement('p');
    $(innerItemText).addClass('username');

    var subInnerItemText = document.createElement('p');
    $(subInnerItemText).addClass('classname');

    $(subInnerItemText).append(document.createTextNode(key));
    $(subInnerItem).append($(subInnerItemText));

    $(innerItemText).append(document.createTextNode(value));
    $(innerItem).append($(innerItemText));
    $(innerItem).append(subInnerItem);
    $(newListItem).append(innerItem);
  });
  $(parentElement).append($(newListItem));  
}

/**
 * @param  {Element}    item       Element where the listener gets appendet to
 * @param  {String}     listener    Name of the listener to append
 * @return {null}
 */
function appendEventListenerToListitem(item, listener) {
  switch (listener) {
    case 'mouse':
      $(item)
        .mouseenter(function() {
          $(item).addClass('hover');
        }).mouseleave(function() {
          $(item).removeClass('hover');
        });
      break;
    case 'click':
      $(item).on('click', function() {
        $(item).toggleClass('selected');
        $.each($('.can-disable'), function(key, element) {
          $(element).attr('disabled', function(key, attribute) {
            return attribute ? false : true;
          });
        });
      });
      break;
    default:
    break;
  }
}
