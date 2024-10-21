const sql = require('mssql');

const config = {
  server: 'localhost',          // Your SQL Server's address (if local, use 'localhost')
  database: 'Cultiva',          // Your actual database name is "Cultiva"
  options: {
    trustedConnection: true,    // This enables Windows Authentication
    trustServerCertificate: true // Allows self-signed certificates (if applicable)
  }
};

async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log('Connected to the database using Windows Authentication!');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

module.exports = { connectToDatabase, sql };


