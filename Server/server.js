const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase, sql } = require('./dbConfig');

const app = express();
const port = 3000;

app.use(bodyParser.json()); // Middleware to parse JSON requests

// Connect to the SQL Server database
connectToDatabase();

// Route to GET data from the database
app.get('/plants', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Plantas'); // Change 'Plants' to your actual table name
    res.json(result.recordset); // Send the query result as JSON
  } catch (err) {
    res.status(500).send('Database query failed');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
