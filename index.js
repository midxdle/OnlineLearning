const express = require("express");
const session = require('express-session');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');
const passport = require("passport");
const localStrategy = require('passport-local').Strategy;
const createError = require('http-errors');
const path = require('path');

let db = require('./database/mongo');
let homeRouter = require('./routes/home');
let usersRouter = require('./routes/users');

const app = module.exports = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//testing purpose
app.use(express.static(path.join(__dirname, 'public')));
//testing purpose

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter : (param, msg, value) => {
    let namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use(require('connect-flash')());
app.use( (req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

app.use('/', homeRouter);
app.use('/users', usersRouter);
