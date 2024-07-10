const uuid = require('uuid');
const ErrorResponse = require('../utils/error-response');
const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const User = require('../models/user.model');

// @decr     Register new user
// @route    Post /api/v1/auth/register
// @access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const apiKey = uuid.v4();

  const user = await User.create({
    name,
    email,
    password,
    apiKey,
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @decr     Login user
// @route    Post /api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  // Validate email && password
  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  const user = await User.findOne({ email });

  // Check user
  if (!user) {
    throw new ErrorResponse('Invalid Credentials', 401);
  }

  // Check for password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid Credentials', 401);
  }

  const token = user.generateJwtToken();

  res.status(200).json({
    success: true,
    data: user,
    token,
  });
});

// @decr     Get profile
// @route    Get /api/v1/auth/profile
// @access   Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @decr     Update user
// @route    Put /api/v1/auth/update
// @access   Private
exports.update = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const user = await User.findById(req.user._id);
  const { name, email } = req.body;

  const foundUserByEmail = await User.findOne({ email });

  if (!foundUserByEmail._id.equals(user._id)) {
    throw new ErrorResponse('Such a user already exists', 400);
  }

  const editedUser = {
    name: name || user.name,
    email: email || user.email,
  };

  const updatedUser = await User.findByIdAndUpdate(req.user._id, editedUser, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// @decr     Update user password
// @route    Put /api/v1/auth/update-password
// @access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const user = await User.findById(req.user._id);
  const { oldPassword, newPassword } = req.body;

  // Check current password
  if (!(await user.matchPassword(oldPassword))) {
    return next(new ErrorResponse('Old password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  const token = user.generateJwtToken();

  res.status(200).json({
    success: true,
    data: user,
    token,
  });
});

// @decr     Payment balance
// @route    Put /api/v1/auth/payment-balance
// @access   Private
exports.paymentBalance = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  // CLICK, PAYME
  const userId = req.user._id;

  const foundUser = await User.findById(userId);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      balance: foundUser.balance + req.body.payment,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// @decr     Activate Status
// @route    Put /api/v1/auth/activate
// @access   Private
exports.activateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const apiCost = process.env.API_COST;

  if (user.balance < apiCost) {
    const needMoney = apiCost - user.balance;
    return next(
      new ErrorResponse(
        `Your balance is less than ${apiCost}. You need ${needMoney}`,
        400
      )
    );
  }

  await User.findByIdAndUpdate(
    userId,
    { balance: user.balance - apiCost, isActive: true },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    apiKey: user.apiKey,
    message: 'Your profile successfully activated',
  });
});
