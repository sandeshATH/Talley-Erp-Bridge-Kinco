const XLSX = require('xlsx');
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

async function exportInvoices(req, res) {
  try {
    const { format, fromDate } = req.query;
    const invoices = await fetchInvoices({ fromDate });

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(invoices);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.xlsx"');
      return res.send(buf);
    }

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(invoices);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
      return res.send(csv);
    }

    res.status(400).json({ error: 'Invalid format. Use ?format=excel or ?format=csv' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getInvoices,
  exportInvoices,
};
