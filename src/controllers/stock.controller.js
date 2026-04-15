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

const getStock = async (req, res) => {
  try {
    const data = await tallyService.fetchStock();
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Stock fetch error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStockRaw = async (req, res) => {
  try {
    const data = await tallyService.fetchStockRaw();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveStock = async (req, res) => {
  try {
    const data = await tallyService.fetchStock();
    const filePath = path.join(exportBasePath(), 'stock-data.json');
    fs.writeFileSync(filePath, JSON.stringify({
      count: data.length,
      data,
    }, null, 2));
    res.json({
      success: true,
      message: `Saved ${data.length} stock items to desktop`,
      filePath,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStockRawSave = async (req, res) => {
  try {
    const data = await tallyService.fetchStockRaw();
    const filePath = path.join(exportBasePath(), 'stock-raw-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({
      success: true,
      message: `Raw stock data saved to desktop`,
      filePath,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportStock = async (req, res) => {
  try {
    const { format } = req.query;
    const data = await tallyService.fetchStock();

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stock');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="stock.xlsx"');
      return res.send(buf);
    }

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="stock.csv"');
      return res.send(csv);
    }

    res.status(400).json({ error: 'Invalid format. Use ?format=excel or ?format=csv' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getStock, getStockRaw, saveStock, getStockRawSave, exportStock };
