const mongoose = require("mongoose");

let contentSchema = mongoose.Schema({
  courseID: {
    type: String,
    index: true,
  },
  name: {
    type: String,
  },
});

let content = (module.exports = mongoose.model("content", contentSchema));

module.exports.createContent = (newContent, callback) => {
  newContent.save(callback);
};
