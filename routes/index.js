const express = require('express');
const router = express.Router();
const { getDocumentsNearLocation } = require('../scripts/data');

// Define the Default GET endpoint
router.get('/', (req, res) => {
  res.send('GET successful');
});

// Define the GET endpoint
router.get('/:path*', (req, res) => {
  res.send('GET: ' + req.params.path);
});

// Define the Default POST endpoint
router.post('/', (req, res) => {
  res.send('POST successful');
});

// Define the POST endpoint
router.post('/lat/:latitude/long/:longitude', async (req, res) => {
  try {
    const latitude = parseFloat(req.params.latitude); // Ensure numerical type
    const longitude = parseFloat(req.params.longitude); // Ensure numerical type

    const target = {
      latitude,
      longitude
    };

    const documents = await getDocumentsNearLocation(target);

    res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

module.exports = router;
