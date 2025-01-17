import express from 'express';
import { getDocumentsNearLocation } from '../scripts/ipfs.js';
import { generateArticle } from '../scripts/ai.js';

const router = express.Router();

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
    const latitude = parseFloat(req.params.latitude);
    const longitude = parseFloat(req.params.longitude);

    const target = {
      latitude,
      longitude
    };

    const documents = await getDocumentsNearLocation(target);
    const article = await generateArticle(documents);
    res.send(article);
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing the request.',
      details: error.message 
    });
  }
});

export default router;
