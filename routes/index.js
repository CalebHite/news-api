const express = require('express');
const router = express.Router();

// Define the GET endpoint
router.get('/', (req, res) => {
  res.send('Welcome to the simple API!');
});

module.exports = router;
