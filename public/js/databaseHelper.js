module.exports = {
  write: function(databaseObject, position, value) {
    databaseObject.ref(position).set(value);
  },
  getStudentPromise: function(databaseObject, refStudentUID) {
    return databaseObject.ref(refStudentUID).once("value").then(function(data) {
      return data.val();
    });
  }
  getAllStudentsPromise: function(databaseObject, refStudent) {
    return databaseObject.ref(refStudent).once("value").then(function(data) {
      return data.val();
    });
  },
  getTimetablePromise: function(databaseObject, refTimetable) {
    return databaseObject.ref(refTimetable).once("value").then(function(data) {
      return data.val();
    });
  },
  getClasslistPromise: function(databaseObject, refClasslist) {
    return databaseObject.ref(refClasslist).once("value").then(function(data) {
      return data.val();
    });
  }
};
