const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const Planet = require('../models/planet.model');
const Star = require('../models/star.model');
const ErrorResponse = require('../utils/error-response');

// @decr     Create new planet
// @route    POST /api/v1/planets/
// @access   Private / admin
exports.create = asyncHandler(async (req, res, next) => {
  const {
    name,
    distanceToStar,
    diametr,
    yearDuration,
    dayDuration,
    temperature,
    sequenceNumber,
    satellites,
    star,
  } = req.body;

  const foundStar = await Star.findOne({ name: star });
  if (!foundStar) {
    throw new ErrorResponse('Star not found', 404);
  }

  const newPlanet = await Planet.create({
    name,
    distanceToStar,
    diametr,
    yearDuration,
    dayDuration,
    temperature,
    sequenceNumber,
    satellites,
    image: 'uploads/' + req.file.filename,
    star: foundStar._id,
  });

  await Star.findByIdAndUpdate(
    foundStar._id,
    {
      $push: { planets: newPlanet._id },
    },
    { new: true, upsert: true }
  );

  res.status(201).json({
    success: true,
    data: newPlanet,
  });
});

// @decr     Get all planets
// @route    GET /api/v1/planets/
// @access   Public / with apiKey
exports.findAll = asyncHandler(async (req, res, next) => {
  const envPageLimit = process.env.DEFAULT_PAGE_LIMIT || 2;
  const limit = parseInt(req.body.limit || envPageLimit);
  const page = parseInt(req.query.page || 1);

  const total = await Planet.countDocuments();

  const planets = await Planet.find()
    .skip(page * limit - limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    pageCount: total / limit,
    currentPage: page,
    nextPage: total / limit < page + 1 ? null : page + 1,
    data: planets,
  });
});

// @decr     Get one planet
// @route    GET /api/v1/planets/:id
// @access   Public / with apiKey
exports.findOne = asyncHandler(async (req, res, next) => {
  const planet = await Planet.findById(req.params.id);
  if (!planet) {
    throw new ErrorResponse('Planet Not Found', 404);
  }

  res.status(200).json({
    success: true,
    data: planet,
  });
});

// @decr     Update planet
// @route    PUT /api/v1/planets/:id
// @access   Private / admin
exports.update = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const id = req.params.id;
  const {
    name,
    distanceToStar,
    diametr,
    yearDuration,
    dayDuration,
    temperature,
    sequenceNumber,
    satellites,
  } = req.body;

  const foundPlanet = await Planet.findById(id);
  if (!foundPlanet) {
    throw new ErrorResponse('Planet not found', 404);
  }

  const editedPlanet = {
    name: name || foundPlanet.name,
    distanceToStar: distanceToStar || foundPlanet.distanceToStar,
    yearDuration: yearDuration || foundPlanet.yearDuration,
    dayDuration: dayDuration || foundPlanet.dayDuration,
    sequenceNumber: sequenceNumber || foundPlanet.sequenceNumber,
    temperature: temperature || foundPlanet.temperature,
    satellites: satellites || foundPlanet.satellites,
    diametr: diametr || foundPlanet.diametr,
  };

  const updatedPlanet = await Planet.findByIdAndUpdate(id, editedPlanet, {
    new: true,
  });

  res.status(200).json({
    success: true,
    data: updatedPlanet,
  });
});

// @decr     Delete planet
// @route    DELETE /api/v1/planets/:id
// @access   Private / admin
exports.remove = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ErrorResponse(errors.array()[0].msg, 400);
  }

  const id = req.params.id;

  const deletedPlanet = await Planet.findByIdAndDelete(id);
  if (!deletedPlanet) {
    throw new ErrorResponse('Planet not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Deleted successfully',
  });
});
