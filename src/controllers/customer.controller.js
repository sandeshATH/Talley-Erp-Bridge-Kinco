const { fetchCustomers } = require('../services/tally.service');

async function getCustomers(req, res) {
  try {
    const customers = await fetchCustomers();
    res.json({ data: customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCustomers,
};
