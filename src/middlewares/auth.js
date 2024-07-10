const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/error-response');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Protecting route
exports.protected = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || token.split(' ')[0] !== 'Bearer') {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET_KEY);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ErrorResponse('Unauthorized', 401);
  }

  req.user = user;
  next();
});

// Grant access to admins
exports.adminAccess = (req, res, next) => {
  if (!req.user.adminStatus) {
    return next(
      new ErrorResponse('This route can be access only admin status users', 403)
    );
  }

  next();
};

// API Key access
exports.apiKeyAccess = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const key = req.headers['apikey'];

  //   Check token
  if (!key) {
    return next(new ErrorResponse('No API key to access this route', 403));
  }

  const user = await User.findOne({ apiKey: key });

  //   Check if user exist
  if (!user) {
    return next(new ErrorResponse('No user found by this API key', 400));
  }

  //   Check if user status active
  if (!user.isActive) {
    return next(
      new ErrorResponse('Please activate your status to get response', 403)
    );
  }

  next();
});
