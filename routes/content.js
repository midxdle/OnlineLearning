const express = require("express");
const router = express.Router();
const course = require("../models/course");
const content = require("../models/content");
const user = require("../models/user");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.send("404 ERROR PAGE!");
});

router.get("/:id", ensureAuthenticated, (req, res, next) => {
  content.findOne({ _id: req.params.id }, (err, contents) => {
    if (err) throw err;

    res.render("content", { contents: contents });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

router.post("/:id", (req, res, next) => {
  let courseID = req.body.courseID;
  let username = req.body.username;
  let password = req.body.password;

  req.checkBody("courseID", "ID is required").notEmpty();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    content.findOne({ _id: req.params.id }, (err, contents) => {
      if (err) throw err;

      req.flash("error", "Empty fields required");
      res.location(`/content/${contents._id}`);
      res.redirect(`/content/${contents._id}`);
    });
  } else {
    user.findOne({ username: username }, (err, user) => {
      if (err || user === null) {
        content.findOne({ _id: req.params.id }, (err, contents) => {
          if (err) throw err;

          req.flash("error", "Username is invalid");
          res.location(`/content/${contents._id}`);
          res.redirect(`/content/${contents._id}`);
        });
      } else {
        course.updateOne(
          { _id: courseID },
          {
            studentID: user._id,
          },
          (err) => {
            if (err) {
              content.findOne({ _id: req.params.id }, (err, contents) => {
                if (err) throw err;

                req.flash("error", "ID is invalid");
                res.location(`/content/${contents._id}`);
                res.redirect(`/content/${contents._id}`);
              });
            } else {
              content.findOne({ _id: req.params.id }, (err, contents) => {
                if (err) throw err;

                req.flash("success", "Purchase was successful");
                res.location(`/content/${contents._id}`);
                res.redirect(`/content/${contents._id}`);
              });
            }
          }
        );
      }
    });
  }
});

module.exports = router;
