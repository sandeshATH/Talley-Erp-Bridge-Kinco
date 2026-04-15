const tallyService = require('../services/tally.service');
const fs = require('fs');
const path = require('path');
const os = require('os');
const XLSX = require('xlsx');

const exportBasePath = () => {
  const base = process.env.EXPORT_PATH || path.join(os.homedir(), 'TallyBridge-exports');
  fs.mkdirSync(base, { recursive: true });
  return base;
};

const getVouchers = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await tallyService.fetchVouchers({ fromDate, toDate });
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Voucher fetch error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVouchersRaw = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await tallyService.fetchVouchersRaw({ fromDate, toDate });
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveVouchers = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await tallyService.fetchVouchers({ fromDate, toDate });
    const filePath = path.join(exportBasePath(), 'vouchers-data.json');
    fs.writeFileSync(filePath, JSON.stringify({
      count: data.length,
      data,
    }, null, 2));
    res.json({
      success: true,
      message: `Saved ${data.length} vouchers to desktop`,
      filePath,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveVouchersRaw = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await tallyService.fetchVouchersRaw({ fromDate, toDate });
    const filePath = path.join(exportBasePath(), 'vouchers-raw-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({
      success: true,
      message: `Raw vouchers saved to desktop`,
      filePath,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportVouchers = async (req, res) => {
  try {
    const { format, fromDate, toDate } = req.query;
    const data = await tallyService.fetchVouchers({ fromDate, toDate });

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vouchers');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="vouchers.xlsx"');
      return res.send(buf);
    }

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="vouchers.csv"');
      return res.send(csv);
    }

    res.status(400).json({ error: 'Invalid format. Use ?format=excel or ?format=csv' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getVouchers, getVouchersRaw, saveVouchers, saveVouchersRaw, exportVouchers };
