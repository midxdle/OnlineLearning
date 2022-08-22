const express = require("express");
const router = express.Router();
const course = require("../models/course");
const content = require("../models/content");

router.get("/", ensureAuthenticated, (req, res, next) => {
  course.find({}, (err, courses) => {
    if (err) throw err;

    content.find({}, (err, contents) => {
      if (err) throw err;

      res.render("home", {
        title: "members",
        courses: courses,
        contents: contents,
      });
    });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

module.exports = router;
