const mongoose = require("mongoose");

let buySchema = mongoose.Schema({
  courseID: {
    type: String,
    index: true,
  },
  studentID: {
    type: String,
  },
});

let buy = (module.exports = mongoose.model("buy", buySchema));
