const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const path = require('path');

// Initialize env variable
dotenv.config();

// Connection to database
connectDB();

// App instance
const app = express();

app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Register routes
app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/stars', require('./routes/star.route'));
app.use('/api/v1/planets', require('./routes/planet.route'));

// Error route
app.use(errorHandler);

const PORT = process.env.SERVER_PORT || 300;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.brightWhite
      .bold
  );
});
