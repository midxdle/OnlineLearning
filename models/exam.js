const mongoose = require("mongoose");

let examSchema = mongoose.Schema({
  name: {
    type: String,
    index: true,
  },
  score: {
    type: String,
  },
  contentID: {
    type: String,
  },
  lock: {
    type: Boolean,
  },
  prev: {
    type: String,
  },
  certificate: {
    type: Boolean,
  },
});

let exam = (module.exports = mongoose.model("exam", examSchema));
