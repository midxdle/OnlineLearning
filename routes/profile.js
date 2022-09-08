const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const user = require("../models/user");
const buy = require("../models/buy");

// profile page
router.get("/", ensureAuthenticated, (req, res, next) => {
  // get user
  let getUser = req.user;
  // find purchased courses by user
  buy.find({ studentID: getUser._id }, (err, buys) => {

    res.render("user/profile", { title: "profile", getUser: getUser, buys: buys });
  }) 
  
});

// check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

// editing user profile page
router.get("/edit", ensureAuthenticated, (req, res, next) => {
  let getUser = req.user;
  res.render("user/edit", { getUser: getUser });
});

// edit user informations
router.post("/edit", (req, res, next) => {
  let getUser = req.user;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let verifyPassword = req.body.verifyPassword;
  let studentNumber = req.body.studentNumber;

  req.checkBody("email", "رایانامه قابل قبول نیست.").isEmail();
  req.checkBody("password", "رمز عبور وارد نشده است.").notEmpty();
  req
    .checkBody("verifyPassword", "رمز عبور تایید نمی شود.")
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    res.render("user/edit", {
      errors: errors,
      user: getUser,
    });
    // just change email and password if username and student number are empty
  } else if (username == "" && studentNumber == "") {
    // hash new password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        password = hash;
        // update user
        user.updateOne(
          { _id: getUser._id },
          {
            email: email,
            password: password,
          },
          (err) => {
            if (err) throw err;
            req.flash("success", "تغییرات با موفقیت ثبت شد");
            res.location("/profile");
            res.redirect("/profile");
          }
        );
      });
    });
    // if username is empty change other informations
  } else if (username == "") {
    // hash new password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        password = hash;
        // update user
        user.updateOne(
          { _id: getUser._id },
          {
            email: email,
            password: password,
            studentNumber: studentNumber,
          },
          (err) => {
            if (err) throw err;
            req.flash("success", "تغییرات با موفقیت ثبت شد");
            res.location("/profile");
            res.redirect("/profile");
          }
        );
      });
    });
    // if student number is empty change other informations
  } else if (studentNumber == "") {
    // hash new password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        password = hash;
        // update user
        user.updateOne(
          { _id: getUser._id },
          {
            username: username,
            email: email,
            password: password,
          },
          (err) => {
            if (err) throw err;
            req.flash("success", "تغییرات با موفقیت ثبت شد");
            res.location("/profile");
            res.redirect("/profile");
          }
        );
      });
    });
    // if all informations has been changed
  } else {
    // hash new password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        password = hash;
        // update user
        user.updateOne(
          { _id: getUser._id },
          {
            username: username,
            email: email,
            password: password,
            studentNumber: studentNumber,
          },
          (err) => {
            if (err) throw err;
            req.flash("success", "تغییرات با موفقیت ثبت شد");
            res.location("/profile");
            res.redirect("/profile");
          }
        );
      });
    });
  }
});

module.exports = router;
