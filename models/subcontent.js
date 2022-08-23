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
});

let subcontent = (module.exports = mongoose.model(
  "subcontent",
  subcontentSchema
));
