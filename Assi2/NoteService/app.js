/*
COMP3322 Assignment 2
Creator : Wu Sen Pan 3035782372
INOTEAPP
Expressjs(backend) app.js
*/
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cors = require("cors");
// var cors = require("cors");
// use assignment2
var monk = require("monk");
var db = monk("127.0.0.1:27017/assignment2");

var notesRouter = require("./routes/notes");

var app = express();
app.use(express.urlencoded({ extended: false }));
//set up the cors with session parsed in each response and request
var corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
};
app.use(cors(corsOptions));

var session = require("express-session");
app.use(
  session({
    secret: "abcdefg",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
//server static files
app.use(express.static("public"));
// Make our db accessible to routers
app.use(function (req, res, next) {
  req.db = db;
  next();
});
app.options("*", cors(corsOptions));
//parse all requset to notesRouter
app.use("/", notesRouter);

// for requests not matching the above routes, create 404 error and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// module.exports = app;
app.listen(3001);
