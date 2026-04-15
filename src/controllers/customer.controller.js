const fs = require('fs');
const path = require('path');
const os = require('os');
const XLSX = require('xlsx');
const { fetchCustomers, fetchCustomersRaw } = require('../services/tally.service');

const exportBasePath = () => {
  const base = process.env.EXPORT_PATH || path.join(os.homedir(), 'TallyBridge-exports');
  fs.mkdirSync(base, { recursive: true });
  return base;
};

async function getCustomers(req, res) {
  try {
    const customers = await fetchCustomers();
    res.json({ data: customers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCustomersRaw(req, res) {
  try {
    const raw = await fetchCustomersRaw();

    if (req.query.save === 'true') {
      const filePath = path.join(exportBasePath(), 'customers-raw-data.json');
      fs.writeFileSync(filePath, JSON.stringify(raw, null, 2));
      console.log(`Raw data saved to: ${filePath}`);
      return res.json({
        success: true,
        message: 'Raw data saved successfully',
        filePath,
        size: `${(JSON.stringify(raw).length / 1024 / 1024).toFixed(2)} MB`,
      });
    }

    res.json(raw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function saveCustomers(req, res) {
  try {
    const customers = await fetchCustomers();
    const dataDir = path.join(__dirname, '../../data');
    const filePath = path.join(dataDir, 'customers.json');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(customers, null, 2));
    res.json({ saved: true, count: customers.length, file: filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function exportCustomers(req, res) {
  try {
    const { format } = req.query;
    const customers = await fetchCustomers();

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(customers);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Customers');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="customers.xlsx"');
      return res.send(buf);
    }

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(customers);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
      return res.send(csv);
    }

    res.status(400).json({ error: 'Invalid format. Use ?format=excel or ?format=csv' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCustomers,
  getCustomersRaw,
  saveCustomers,
  exportCustomers,
};
