var express = require('express');

var browserify = require('browserify-middleware');
var Path = require('path');

var passport = require('passport');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var mongoose = require('./database/config');
var MongoStore = require('connect-mongo')(session);

if (process.env.NODE_ENV !== 'test') {

  var app = express();
  var store = new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 1 * 24 * 60 * 60
  });

  require('./config/passport')(passport);

  app.use(morgan('dev'));
  app.use(cookieParser());

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(session({
    secret: 'Jang',
    saveUninitialized: true,
    resave: true,
    store: store
  }));


  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  app.use(function(req, res, next) {
    if (req.isAuthenticated()) {
      res.cookie('isLoggedIn', true);
    }
    next();
  });

  var routes = require('./routes')(app, passport);

  // Start the server!
  var port = process.env.PORT || 4000;
  app.listen(port);
  console.log("Listening on port", port);
} else {
  module.exports = routes;
}
