const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const user = require("../models/user");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.send("404 PAGE NOT FOUND!");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

router.get("/register", (req, res, next) => {
  res.render("register", { title: "register" });
});

router.get("/login", (req, res, next) => {
  res.render("login", { title: "login" });
});



router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "نام کاربری یا رمز عبور اشتباه است.",
  }),
  (req, res) => {
    req.flash("success", "با موفقیت وارد سامانه شدید.");
    res.redirect("/");
    global.start = new Date().getTime()
  }
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  user.getUserById(id, (err, user) => {
    done(err, user);
  });
});

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

router.post("/register", (req, res, next) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let verifyPassword = req.body.verifyPassword;
  let studentNumber = req.body.studentNumber;

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
    res.render("register", {
      errors: errors,
    });
  } else {
    let newUser = new user({
      username: username,
      email: email,
      password: password,
      studentNumber: studentNumber,
    });

    user.createUser(newUser, (err, user) => {
      if (err) throw err;
    });

    req.flash("success", "در سامانه ثبت نام شدید.");
    res.location("/");
    res.redirect("/");
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "با موفقیت خارج شدید.");
    res.redirect("/users/login");
    let end = new Date().getTime()
    let seconds = end - start;
    let time = seconds/1000;
    console.log(time)
  });
});

module.exports = router;
