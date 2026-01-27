const dotenv = require('dotenv');

dotenv.config();

const TALLY_HOST = process.env.TALLY_HOST || 'localhost';
const TALLY_PORT = process.env.TALLY_PORT || '9000';

module.exports = {
  TALLY_HOST,
  TALLY_PORT,
  TALLY_URL: `http://${TALLY_HOST}:${TALLY_PORT}`,
};
