const errorHandler = (err, req, res, next) => {
  const error = { ...err };
  error.message = err.message;
  
  // Message for dev
  console.log(err.stack.red);

  res.status(err.statusCode || 500).json({
    success: false,
    error: error || 'Server error',
  });
};

module.exports = errorHandler;
