function student(){
}

student.prototype.getName = function (){
  return this.name;
};

student.prototype.setUID = function(uid) {
  this.uid = uid;
};

student.prototype.getUID = function() {
  return this.uid;
};

student.prototype.setAttribute = function(attributeKey, attributeValue) {
  this[attributeKey] = attributeValue;
};

student.prototype.getAllAttributes = function() {
  console.log(this);
};
module.exports = student;