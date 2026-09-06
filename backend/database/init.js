/**
 * Runs schema.sql against the configured MySQL server.
 * Usage: npm run db:init
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  console.log('Connected to MySQL. Running schema.sql ...');
  await connection.query(sql);
  console.log('Database initialized successfully ✅');
  await connection.end();
}

run().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
