var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var partials = require('express-partials');
var methodOverride = require('method-override');
var partials = require('express-partials');

var indexRouter = require('./routes/index');
const express = require("express");
//var usersRouter = require('./routes/users');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*
PRÁCTICA 7: ADICIÓN
*/

// Configuracion de la session para almacenarla en BBDD Redis.
app.use(session({secret: "Blog 2022", resave: false, saveUninitialized: true}));

// Este middleware nos permite usar loginUser en las vistas (usando locals.loginUser)
// Debe añadirse antes que el indexRouter
app.use(function(req, res, next) {
  // To use req.loginUser in the views
  console.log(">>>>>>>>>>>>>>", req.session.loginUser);

  res.locals.loginUser = req.session.loginUser && {
    id: req.session.loginUser.id,
    username: req.session.loginUser.username,
    email: req.session.loginUser.email,
    isAdmin: req.session.loginUser.isAdmin
  };
  next();
});

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* MIDDLEWARE SECTION */
app.use(logger('dev'));
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
app.use(partials());
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
