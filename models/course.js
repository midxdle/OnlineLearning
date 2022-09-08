const mongoose = require("mongoose");

let courseSchema = mongoose.Schema({
  name: {
    type: String,
    index: true,
  },
  price: {
    type: String,
  },
  image: {
    type: String,
  },
  details: {
    type: String,
  },
  contentID: {
    type: String,
  }
});

let course = (module.exports = mongoose.model("course", courseSchema));

module.exports.createCourse = (newCourse, callback) => {
  newCourse.save(callback);
};
