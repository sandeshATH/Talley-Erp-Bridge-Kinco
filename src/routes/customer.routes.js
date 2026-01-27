const express = require('express');
const { getCustomers } = require('../controllers/customer.controller');

const router = express.Router();

router.get('/customers', getCustomers);

module.exports = router;
