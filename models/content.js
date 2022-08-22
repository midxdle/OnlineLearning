const mongoose = require("mongoose");

let contentSchema = mongoose.Schema({
  name: {
    type: String,
    index: true,
  },
  contentOne: {
    type: Object,
  },
  contentTwo: {
    type: Object,
  },
  contentThree: {
    type: Object,
  },
  finalExam: {
    type: String,
  },
  finalScore: {
    type: String,
  },
  certificate: {
    type: String,
  },
  lock: {
    type: Boolean,
  },
  courseID: {
    type: String,
  },
});

let content = (module.exports = mongoose.model("content", contentSchema));
