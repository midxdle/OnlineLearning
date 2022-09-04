const mongoose = require("mongoose");

let buySchema = mongoose.Schema({
  contentID: {
    type: String,
    index: true,
  },
  contentName: {
    type: String,
  },
  studentID: {
    type: String,
  },
  stdUsername: {
    type: String,
  },
  stdNumber: {
    type: String,
  },
});

let buy = (module.exports = mongoose.model("buy", buySchema));

module.exports.createBuy = (newBuy, callback) => {
  newBuy.save(callback);
};
