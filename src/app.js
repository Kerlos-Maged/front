// This file is deprecated. All logic has been moved to server.js.
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app; 