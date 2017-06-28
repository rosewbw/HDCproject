var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var config = require('./config/config');

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: '1234567mkh201',
  resave: false,
  cookie: {maxAge: 60*60*1000}
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  console.log(req.url);
  if(!req.session.uid) {    
    if(req.url === '/login') {
      console.log(req.url);
      next();
    } else if(req.url !== '/register' && req.url !== '/register/postHandler') {
      res.render('login',{title:'Login',
        logotext:'storytree editor login',
        style0:'/stylesheets/login.style.css',
        style1:''
      });
    } else {
      next();
    }
  } else if(req.session.uid) {
    next();
  }
});




app.use('/', routes);
app.use('/users', users);
app.use('/api',api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
