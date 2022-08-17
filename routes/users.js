const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const user = require("../models/user");

router.get("/", (req, res, next) => {
  res.send("respond");
});

router.get("/register", (req, res, next) => {
  res.render("register", { title: "register" });
});

router.get("/login", (req, res, next) => {
  res.render("login", { title: "login" });
});

router.post('/login',
  passport.authenticate('local',
    { failureRedirect : '/users/login',
    failureFlash : 'invalid username or password' }),
  (req, res) => {
    req.flash('success', 'you are now logged in');
    res.redirect('/');
  });

  passport.serializeUser( (user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( (id, done) => {
    user.getUserById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new localStrategy( (username, password, done) => {
    
    user.getUserByUsername(username, (err, user) => {
      if(err) throw err;
      if(!user) {
        return done(null, false);
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw done(err);
        if(isMatch) {
          return  done(null, user);
        } else {
          return done(null, false);
        }
      });

    });
  }));


router.post('/register', (req, res, next) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let verifyPassword = req.body.verifyPassword;
    let studentNumber = req.body.studentNumber;
    
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is not valid').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('verifyPassword', 'passwords do not match').equals(req.body.password);
    req.checkBody('studentNumber', 'student number is required').notEmpty();
    
    const errors = req.validationErrors();
    if (errors) {
      res.render('register', {
        errors : errors
      });
    } else {
      let newUser = new user({
        username: username,
        email : email,
        password : password,
        studentNumber : studentNumber
      });

      user.createUser(newUser, (err, user) => {
        if(err) throw err
        console.log((user));
      });

      req.flash('success', 'user registered');
      res.location('/');
      res.redirect('/');
    }
  });

  router.get('/logout', (req, res, next) => {
    req.logout( (err) => {
      if (err) { return next(err); }
      req.flash('success', 'logged out successfuly');
      res.redirect('/users/login');
    });
  });

  module.exports = router;
