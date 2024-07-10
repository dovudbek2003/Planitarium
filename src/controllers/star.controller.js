const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Star = require('../models/star.model');
const ErrorResponse = require('../utils/error-response');

// @decr     Create new star
// @route    POST /api/v1/stars/
// @access   Private / admin
exports.create = asyncHandler(async (req, res, next) => {
  const { name, temperature, massa, diametr } = req.body;

  const newStar = await Star.create({
    name,
    temperature,
    massa,
    diametr,
    image: 'uploads/' + req.file.filename,
  });

  res.status(201).json({
    success: true,
    data: newStar,
  });
});

// @decr     Get all stars
// @route    GET /api/v1/stars/
// @access   Public / with apiKey
exports.findAll = asyncHandler(async (req, res, next) => {
  const envPageLimit = process.env.DEFAULT_PAGE_LIMIT || 2;
  const limit = parseInt(req.body.limit || envPageLimit);
  const page = parseInt(req.query.page || 1);

  const total = await Star.countDocuments();

  const stars = await Star.find()
    .skip(page * limit - limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    pageCount: total / limit,
    currentPage: page,
    nextPage: total / limit < page + 1 ? null : page + 1,
    data: stars,
  });
});

// @decr     Get one star
// @route    GET /api/v1/stars/:id
// @access   Public / with apiKey
exports.findOne = asyncHandler(async (req, res, next) => {
  const star = await Star.findById(req.params.id);
  if (!star) {
    throw new ErrorResponse('Star Not Found', 404);
  }

  res.status(200).json({
    success: true,
    data: star,
  });
});

// @decr     Update star
// @route    PUT /api/v1/stars/:id
// @access   Private / admin
exports.update = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const id = req.params.id;
  const { name, temperature, massa, diametr } = req.body;

  const foundStar = await Star.findById(id);
  if (!foundStar) {
    throw new ErrorResponse('Star not found', 404);
  }

  const editedStar = {
    name: name || foundStar.name,
    temperature: temperature || foundStar.temperature,
    massa: massa || foundStar.massa,
    diametr: diametr || foundStar.diametr,
  };

  const updatedStar = await Star.findByIdAndUpdate(id, editedStar, {
    new: true,
  });

  res.status(200).json({
    success: true,
    data: updatedStar,
  });
});

// @decr     Delete star
// @route    DELETE /api/v1/stars/:id
// @access   Private / admin
exports.remove = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const id = req.params.id;

  const deletedStar = await Star.findByIdAndDelete(id);
  if (!deletedStar) {
    throw new ErrorResponse('Star not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Deleted successfully',
  });
});
