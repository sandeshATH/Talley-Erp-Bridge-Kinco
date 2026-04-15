const express = require('express');
const router = express.Router();
const {
  getVouchers,
  getVouchersRaw,
  saveVouchers,
  saveVouchersRaw,
  exportVouchers,
} = require('../controllers/voucher.controller');

router.get('/export', exportVouchers);
router.get('/save', saveVouchers);
router.get('/raw/save', saveVouchersRaw);
router.get('/raw', getVouchersRaw);
router.get('/', getVouchers);

module.exports = router;
