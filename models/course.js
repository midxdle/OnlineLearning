const mongoose = require('mongoose');

let courseSchema = mongoose.Schema({
  name:{
    type: String,
    index: true,
  },
  price:{
    type: String,
  },
  image:{
    type: String,
  },
  details:{
    type: String,
  },
});

let course = module.exports = mongoose.model('course', courseSchema);

module.exports.getCourseById = (id, callback) => {
  course.findById(id, callback);
}

module.exports.getCourseByname = (name, callback) => {
  let query = { name: name };
  course.findOne(query, callback);
}