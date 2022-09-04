const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const user = require("../models/user");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.send("404 PAGE NOT FOUND!");
});

// check if user authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}
// user register page 
router.get("/register", (req, res, next) => {
  res.render("user/register", { title: "register" });
});

// user login page
router.get("/login", (req, res, next) => {
  res.render("user/login", { title: "login" });
});

// user login
router.post(
  "/login",
  // user passport module for checking username and password
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "نام کاربری یا رمز عبور اشتباه است.",
  }),
  (req, res) => {
    // start login time
    global.start = new Date().getTime();
    // check if user is admin
    let checkAccess = req.user;
    if (
      checkAccess.password ===
      "$2a$10$NwOKRXwD5DMn/mrNlXSug.9vdxdCTrrNTR3BWq6fDw8wSu0fXO2c2"
    ) {
      req.flash("success", "شما با دسترسی ادمین وارد شدید.");
      res.redirect("/admin");
      // check if user is teacher
    } else if (
      checkAccess.password ===
      "$2a$10$4sXWzs43Vr.41cfk.TrXXOOEJylJClWNjOR/gZBGpyGqr8tOyHqay"
    ) {
      req.flash("success", "شما با دسترسی مدرس وارد شدید.");
      res.redirect("/teacher");
    } else {
      req.flash("success", "با موفقیت وارد سامانه شدید.");
      res.redirect("/");
    }
  }
);

// find user ID to maintain user session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// find user by ID to maintain user session
passport.deserializeUser((id, done) => {
  user.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// check username and password of user
passport.use(
  new localStrategy((username, password, done) => {
    user.getUserByUsername(username, (err, user) => {
      if (err) throw err;
      if (!user) {
        return done(null, false);
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw done(err);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });
  })
);

// register new user
router.post("/register", (req, res, next) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let verifyPassword = req.body.verifyPassword;
  let studentNumber = req.body.studentNumber;
  let studyTime = 0;

  req.checkBody("username", "نام کاربری وارد نشده است.").notEmpty();
  req.checkBody("email", "رایانامه وارد نشده است.").notEmpty();
  req.checkBody("email", "رایانامه قابل قبول نیست.").isEmail();
  req.checkBody("password", "رمز عبور وارد نشده است.").notEmpty();
  req
    .checkBody("verifyPassword", "رمز عبور تایید نمی شود.")
    .equals(req.body.password);
  req.checkBody("studentNumber", "شماره دانشجویی وارد نشده است.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("user/register", {
      errors: errors,
    });
  } else {
    // make new user
    let newUser = new user({
      username: username,
      email: email,
      password: password,
      studentNumber: studentNumber,
      studyTime: studyTime,
    });

    // create new user
    user.createUser(newUser, (err, user) => {
      if (err) throw err;
    });

    req.flash("success", "در سامانه ثبت نام شدید.");
    res.location("/");
    res.redirect("/");
  }
});

// logout
router.get("/logout", (req, res, next) => {
  // get user
  let getUser = req.user;
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // calculate user online time
    let end = new Date().getTime();
    let seconds = end - start;
    let time = seconds / 1000;
    // find user
    user.findOne({ _id: getUser._id }, (err, users) => {
      if (err) throw err;
      // check if user is admin or teacher
      if (users.studyTime == undefined || users.studyTime == null) {
        console.log(time);
        console.log("not added");
        // check if user is new
      } else if (users.studyTime == 0) {
        console.log(time);
        console.log("new");
        // update user study time
        user.updateOne(
          { _id: getUser._id },
          {
            studyTime: time,
          },
          (err) => {
            if (err) throw err;
          }
        );
      } else {
        // if user is not new, take previous study time and float it
        // then add new time with old time
        let prevTime = parseFloat(users.studyTime);
        time = time + prevTime;
        console.log(time);
        console.log("added");
        user.updateOne(
          { _id: getUser._id },
          {
            studyTime: time,
          },
          (err) => {
            if (err) throw err;
          }
        );
      }
    });
    req.flash("success", "با موفقیت خارج شدید.");
    res.redirect("/users/login");
  });
});

module.exports = router;
