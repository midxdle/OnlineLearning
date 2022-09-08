const express = require("express");
const router = express.Router();
const course = require("../models/course");

// course page
router.get("/", ensureAuthenticated, (req, res, next) => {
  // find courses
  course.find({}, (err, courses) => {
    if (err) throw err;

    res.render("home", {
      title: "members",
      courses: courses,
    });
  });
});

// check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

module.exports = router;
