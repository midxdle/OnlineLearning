const express = require("express");
const session = require("express-session");
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const path = require("path");

// take routers
let homeRouter = require("./routes/home");
let usersRouter = require("./routes/users");
let contentRouter = require("./routes/content");
let profileRouter = require("./routes/profile");
let adminRouter = require("./routes/admin");
let teacherRouter = require("./routes/teacher");

// use express
const app = (module.exports = express());

// set view directory path and view engine to render pages
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// parse URLs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// set styles directory path
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// errors handler
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      let namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

// show errors
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// render app root for checking authentications
//isAuthenticated method in routes
//if user method in pug format
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// define routes
app.use("/", homeRouter);
app.use("/users", usersRouter);
app.use("/content", contentRouter);
app.use("/profile", profileRouter);
app.use("/admin", adminRouter);
app.use("/teacher", teacherRouter);
