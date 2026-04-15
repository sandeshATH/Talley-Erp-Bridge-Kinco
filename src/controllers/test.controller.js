const tallyService = require('../services/tally.service');

const testReports = async (req, res) => {
  const reports = [
    'Day Book',
    'Sales Register',
    'Purchase Register',
    'Cash Book',
    'Bank Book',
    'Voucher Register',
    'Stock Summary',
    'Trial Balance',
    'Balance Sheet',
    'Profit & Loss',
  ];

  const results = {};

  for (const report of reports) {
    try {
      console.log(`Testing: ${report}`);
      const data = await tallyService.testReport(report);
      
      if (data?.ENVELOPE?.BODY?.DATA?.LINEERROR) {
        results[report] = `❌ Error: ${data.ENVELOPE.BODY.DATA.LINEERROR}`;
      } else {
        results[report] = '✅ Success';
      }
    } catch (error) {
      results[report] = `❌ ${error.message}`;
    }
  }

  res.json({ results });
};

module.exports = { testReports };