let $ = global.jQuery = require('jquery');
module.exports = {
    test: function() {
        console.log('HTML HELPER INIT');
    },
    updateText: function(elementSelector, value) {
        $(elementSelector).innerText = value;
    },
    updateImage: function(elementSelector, value) {
        $(elementSelector).get(0).src = value;
    },
    updateList: function(itemInformation, itemClass, parentElement, options) {
        createItemlist(itemInformation, itemClass, parentElement, options);
    },
    updateColor: function(elementSelector, value) {

    },
};


/**
 * @param  {Json}       itemInformation     Single line informations
 * @param  {String}     itemClass           Classname to append
 * @param  {Element}    parentElement       Where to append the li
 * @param  {Json}       options             Append listener etc.
 * @return {null} Element will be appendet directly
 */
function createItemlist(itemInformation, itemClass, parentElement, options) {
    console.log(itemInformation);
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
                $.each($('.can-disable'), function(key, element){
                    $(element).attr('disabled', function(key, attribute){
                        return attribute ? false : true;
                    });
                });
            });            
            break;
        default:

    }
}
