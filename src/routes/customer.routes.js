const express = require('express');
const { getCustomers, getCustomersRaw, saveCustomers, exportCustomers } = require('../controllers/customer.controller');

const router = express.Router();

router.get('/customers/export', exportCustomers);
router.get('/customers', getCustomers);
router.get('/customers/raw', getCustomersRaw);
router.get('/customers/save', saveCustomers);

module.exports = router;
