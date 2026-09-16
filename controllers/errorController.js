const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let field = 'field';
  let value = '';

  if (err.keyValue) {
    field = Object.keys(err.keyValue)[0];
    value = Object.values(err.keyValue)[0];
  } else if (err.errmsg) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    value = match ? match[0].replace(/"/g, '') : '';
  }

  if (field === 'email') {
    return new AppError(
      'An account with this email address already exists. Please use another email or log in.',
      400,
    );
  }

  const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
  const message = `${formattedField} "${value}" is already taken. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(statusCode).json({
        status: status,
        message: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Preserve message and name explicitly alongside properties needed by handlers
    let error = Object.create(err);
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;
    error.path = err.path;
    error.value = err.value;
    error.errmsg = err.errmsg;
    error.keyValue = err.keyValue;
    error.errors = err.errors;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
