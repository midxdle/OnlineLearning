const express = require("express");
const flash = require("connect-flash");
const events = require("events");
const eventEmitter = new events.EventEmitter();
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

app.get("/", function () {});
