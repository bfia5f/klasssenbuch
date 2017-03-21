function intelliList(name) {
    this.name = name;
    this.listStorage = [];
}

intelliList.prototype.getName = function () {
    return this.name;
}

/**
 * Create and append listitem elements
 * @param {DOM} parentElement Element that the child should be appended to
 * @param {string} classname class appended to the listitem
 * @param {string} id id of the listitem
 * @param {JSON} options eventlistener, details, etc.
 * @returns {boolean} if the element has been created or not
 */
intelliList.prototype.appendListElement = function (parentElement, classname, id, options) {
    if (typeof parentElement === undefined || typeof parentElement === null) {
        return false;
    } else {
        return true;
    }
}

intelliList.prototype.storeList = function (parentElement, listname) {
    this.listStorage.push({
        [listname]: parentElement
    })
}
intelliList.prototype.getStoredList = function (listname){
    console.log(this.listStorage);
}
module.exports = intelliList;