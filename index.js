const express = require("express");
const path = require('path');
const flash = require("connect-flash");
const db = require("./database/mongo");

const app = module.exports = express();

app.use(flash());
app.use(function (req, res, next) {
  let messages = require("express-messages")(req, res);
  res.locals.messages = function (chunk, context, bodies, params) {
    return chunk.write(messages());
  };
  next();
});

let homeRouter = require('./routes/home');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', homeRouter);
