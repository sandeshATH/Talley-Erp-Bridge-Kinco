const express = require('express');
const router = express.Router();
const { getStock, getStockRaw, getStockRawSave, saveStock, exportStock } = require('../controllers/stock.controller');

router.get('/export', exportStock);
router.get('/save', saveStock);
router.get('/raw/save', getStockRawSave);
router.get('/raw', getStockRaw);
router.get('/', getStock);

module.exports = router;
