const express = require('express');
const router = express.Router();
const course = require('../models/course');

router.get('/', ensureAuthenticated ,(req, res, next) => {
  course.find({}, (err, courses) => {
    if (err) throw err;
    res.render('home', { title: 'members', courses: courses} );
  })
});

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } 
  res.redirect('/users/login');
}

module.exports = router;