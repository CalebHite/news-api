import express from 'express';
import indexRouter from './routes/index.js';

const app = express();

// Middleware for parsing JSON (if needed in the future)
app.use(express.json());

// Use the index router for the root path
app.use('/', indexRouter);

// Set the port
const PORT = 4000; // Change the port number to your desired port

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
