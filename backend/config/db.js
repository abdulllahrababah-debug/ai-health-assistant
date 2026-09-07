const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
    uri: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  }
  : {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_health_assistant',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  };

const pool = mysql.createPool(poolConfig);

module.exports = pool;
