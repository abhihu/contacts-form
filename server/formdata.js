
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle form submission
app.post('/submit', (req, res) => {
  const { name, email, phone } = req.body;
  console.log('Received contact:', { name, email, phone });

  res.send('Contact received successfully!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});