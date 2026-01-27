const { fetchInvoices } = require('../services/tally.service');

async function getInvoices(req, res) {
  try {
    const { fromDate } = req.query;
    const invoices = await fetchInvoices({ fromDate });
    res.json({ data: invoices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getInvoices,
};
