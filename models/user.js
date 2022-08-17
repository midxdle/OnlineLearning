const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  studentNumber: {
    type: String,
  },
});

let user = module.exports = mongoose.model("user", userSchema);

module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserById = (id, callback) => {
  user.findById(id, callback);
};

module.exports.getUserByUsername = (username, callback) => {
  let query = { username: username };
  user.findOne(query, callback);
};
