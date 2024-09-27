const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const checkUserExists = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows.length > 0;
};

const registerUser = async (email, hashedPassword, rol, lenguage) => {
  await pool.query(
    'INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)',
    [email, hashedPassword, rol, lenguage]
  );
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  checkUserExists,
  registerUser,
  getUserByEmail,
};
