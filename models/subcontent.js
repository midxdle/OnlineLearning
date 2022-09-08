const mongoose = require("mongoose");

let subcontentSchema = mongoose.Schema({
  name: {
    type: String,
  },
  contentID: {
    type: String,
    index: true,
  },
  book: {
    type: String,
  },
  pdf: {
    type: String,
  },
  video: {
    type: String,
  },
  lock: {
    type: Boolean,
  },
  prev: {
    type: String,
  },
  score: {
    type: String,
  },
  certificate: {
    type: Boolean,
  },
  endTime: {
    type: String,
  }
});

let subcontent = (module.exports = mongoose.model(
  "subcontent",
  subcontentSchema
));

module.exports.createSubContent = (newSubContent, callback) => {
  newSubContent.save(callback);
};
