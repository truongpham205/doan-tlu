/* eslint-disable import/no-unresolved */
const express = require('express');
const path = require('path');

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');

const app = express();

/**
 * [BEGIN] Setup Crashlytics
 */
/* [END] CRASHLYTICS */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(compression());
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', require('@routes/usersRouter'));
app.use('/customer', require('@routes/customerRouter'));
app.use('/provider', require('@routes/providerRouter'));
app.use('/sale', require('@routes/saleRouter'));
app.use('/service', require('@routes/serviceRouter'));
app.use('/news', require('@routes/newsRouter'));
app.use('/order', require('@routes/orderRouter'));
app.use('/filter', require('@routes/filterRouter'));
app.use('/tour', require('@routes/tourRouter'));

// app.use(Sentry.Handlers.errorHandler());

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

const { AppError } = require('./src/utils/constant');

app.use((error) => {
  // if ((error && error.status == 404) || error.status) {
  //   return true;
  // }
  // Capture all 404 and 500 errors
  if (!(error instanceof AppError)) {
    return true;
  }
  return false;
});

// error handler
// no stacktraces leaked to user unless in development environment
const response = require('./src/common/response');

app.use((err, req, res, next) => {
  res.status(err.status || 200);
  res.json(response.error(err, null, app.get('env') === 'development' ? err.stack : ''));
  // res.render('error', {
  //   message: err.message,
  //   error: app.get('env') === 'development' ? err : {},
  // });
});

module.exports = app;
