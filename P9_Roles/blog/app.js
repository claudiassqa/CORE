var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var indexRouter = require('./routes/index');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(methodOverride('_method', {methods: ["POST", "GET"]}));

var partials = require('express-partials');
app.use(partials());

// Configuracion de la session para almacenarla en BBDD Redis.
app.use(session({secret: "Blog 2022",
  resave: false,
  saveUninitialized: true}));

// Este mw permite usar loginUser en las vistas (usando locals.loginUser)
app.use(function(req, res, next) {

  console.log(">>>>>>>>>>>>>>", req.session.loginUser);

  // To use req.loginUser in the views
  res.locals.loginUser = req.session.loginUser && {
    id: req.session.loginUser.id,
    username: req.session.loginUser.username,
    email: req.session.loginUser.email,
    isAdmin: req.session.loginUser.isAdmin
  };

  next();
});

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
