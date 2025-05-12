const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'admin',
  password: 'password',
  host: 'localhost',
  port: 5433,
  database: 'maintenance_db',
});

module.exports = pool;
