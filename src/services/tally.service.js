const http = require('http');
const xml2js = require('xml2js');
const { 
  buildCustomerRequest, 
  buildInvoiceRequest, 
  buildPingRequest, 
  buildStockRequest,
  buildVoucherRequest 
} = require('../utils/xml.builder');
const { mapCustomers, mapInvoices, mapStock, mapVouchers } = require('../utils/mapper');

const TALLY_HOST = process.env.TALLY_HOST || '127.0.0.1';
const TALLY_PORT = process.env.TALLY_PORT || '9011';
const TALLY_TIMEOUT_MS = Number(process.env.TALLY_TIMEOUT_MS) || 30000;
const TALLY_COMPANY = process.env.TALLY_COMPANY || '';
const TALLY_LEDGER_GROUP = process.env.TALLY_LEDGER_GROUP || '';
const TALLY_SALESMAN = process.env.TALLY_SALESMAN || '';
const TALLY_LEDGER_REPORT = process.env.TALLY_LEDGER_REPORT || 'List of Accounts';
const TALLY_REQUEST_STYLE = process.env.TALLY_REQUEST_STYLE || 'legacy';

const parser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true,
  trim: true,
});

async function postXml(xml) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TALLY_HOST,
      port: Number(TALLY_PORT),
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Content-Length': Buffer.byteLength(xml),
        'Connection': 'close'
      },
      timeout: TALLY_TIMEOUT_MS
    };

    console.log(`Connecting to Tally at ${TALLY_HOST}:${TALLY_PORT}...`);

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`Tally responded with status: ${res.statusCode}`);
      
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', async () => {
        try {
          console.log(`Received ${data.length} characters from Tally`);
          
          if (!data || data.trim() === '') {
            reject(new Error('Empty response from Tally'));
            return;
          }
          
          const json = await parser.parseStringPromise(data);
          resolve(json);
        } catch (error) {
          console.error('Parse error:', error.message);
          reject(new Error(`XML parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Connection error:', error.message);
      reject(new Error(`Connection error: ${error.message}`));
    });

    req.on('timeout', () => {
      console.error('Request timeout!');
      req.destroy();
      reject(new Error('Request timeout - Tally did not respond'));
    });

    req.write(xml);
    req.end();
  });
}

async function testReport(reportName) {
  const companyName = TALLY_COMPANY ? TALLY_COMPANY.replace(/&/g, '&amp;') : '';
  const username = process.env.TALLY_USERNAME || '';
  const password = process.env.TALLY_PASSWORD || '';

  const xml = `<ENVELOPE>
<HEADER>
<TALLYREQUEST>Export Data</TALLYREQUEST>
</HEADER>
<BODY>
<EXPORTDATA>
<REQUESTDESC>
<REPORTNAME>${reportName}</REPORTNAME>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
${companyName ? `<SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>` : ''}
${username ? `<SVUSER>${username}</SVUSER>` : ''}
${password ? `<SVPASSWORD>${password}</SVPASSWORD>` : ''}
</STATICVARIABLES>
</REQUESTDESC>
</EXPORTDATA>
</BODY>
</ENVELOPE>`;

  return postXml(xml);
}


// ─────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────
async function fetchCustomers() {
  const xml = buildCustomerRequest(TALLY_COMPANY, TALLY_LEDGER_REPORT, TALLY_REQUEST_STYLE);
  const json = await postXml(xml);
  const result = mapCustomers(json, TALLY_LEDGER_GROUP, TALLY_SALESMAN);
  console.log('After mapping - customers found:', result.length);
  return result;
}

async function fetchCustomersRaw() {
  const xml = buildCustomerRequest(TALLY_COMPANY, TALLY_LEDGER_REPORT, TALLY_REQUEST_STYLE);
  return postXml(xml);
}

// ─────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────
async function fetchInvoices({ fromDate, toDate } = {}) {
  const xml = buildInvoiceRequest(fromDate, toDate, TALLY_COMPANY);
  const json = await postXml(xml);
  return mapInvoices(json);
}

// ─────────────────────────────────────────
// STOCK
// ─────────────────────────────────────────
async function fetchStock() {
  const xml = buildStockRequest(TALLY_COMPANY);
  const json = await postXml(xml);
  const result = mapStock(json);
  console.log('After mapping - stock items found:', result.length);
  return result;
}

async function fetchStockRaw() {
  const xml = buildStockRequest(TALLY_COMPANY);
  return postXml(xml);
}

// ─────────────────────────────────────────
// VOUCHERS
// ─────────────────────────────────────────
async function fetchVouchers({ fromDate, toDate } = {}) {
  const xml = buildVoucherRequest(TALLY_COMPANY, fromDate, toDate);
  const json = await postXml(xml);
  const result = mapVouchers(json);
  console.log('After mapping - vouchers found:', result.length);
  return result;
}

async function fetchVouchersRaw({ fromDate, toDate } = {}) {
  const xml = buildVoucherRequest(TALLY_COMPANY, fromDate, toDate);
  console.log('\n=== VOUCHER XML REQUEST ===');
  console.log(xml);
  console.log('=========================\n');
  return postXml(xml);
}

// ─────────────────────────────────────────
// PING
// ─────────────────────────────────────────
async function pingTally() {
  const xml = buildPingRequest();
  await postXml(xml);
  return true;
}

module.exports = {
  fetchCustomers,
  fetchCustomersRaw,
  fetchInvoices,
  fetchStock,
  fetchStockRaw,
  fetchVouchers,
  fetchVouchersRaw,
  pingTally,
    testReport,

};
