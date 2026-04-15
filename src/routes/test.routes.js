const express = require('express');
const router = express.Router();
const { testReports } = require('../controllers/test.controller');

router.get('/', testReports);

module.exports = router;