const express = require('express');
const { getInvoices, exportInvoices } = require('../controllers/invoice.controller');

const router = express.Router();

router.get('/invoices/export', exportInvoices);
router.get('/invoices', getInvoices);

module.exports = router;
