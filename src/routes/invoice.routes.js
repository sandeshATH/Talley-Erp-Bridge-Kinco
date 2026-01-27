const express = require('express');
const { getInvoices } = require('../controllers/invoice.controller');

const router = express.Router();

router.get('/invoices', getInvoices);

module.exports = router;
