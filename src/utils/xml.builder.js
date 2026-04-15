// Builds XML payloads for Tally XML-over-HTTP requests

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildCustomerRequest(companyName, reportName, requestStyle) {
  const safeCompany = companyName ? escapeXml(companyName) : '';
  const username = process.env.TALLY_USERNAME || '';
  const password = process.env.TALLY_PASSWORD || '';

  return `<ENVELOPE>
<HEADER>
<TALLYREQUEST>Export Data</TALLYREQUEST>
</HEADER>
<BODY>
<EXPORTDATA>
<REQUESTDESC>
<REPORTNAME>List of Accounts</REPORTNAME>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
${safeCompany ? `<SVCURRENTCOMPANY>${safeCompany}</SVCURRENTCOMPANY>` : ''}
${username ? `<SVUSER>${escapeXml(username)}</SVUSER>` : ''}
${password ? `<SVPASSWORD>${escapeXml(password)}</SVPASSWORD>` : ''}
</STATICVARIABLES>
</REQUESTDESC>
</EXPORTDATA>
</BODY>
</ENVELOPE>`;
}

function buildStockRequest(companyName) {
  const safeCompany = companyName ? escapeXml(companyName) : '';
  const username = process.env.TALLY_USERNAME || '';
  const password = process.env.TALLY_PASSWORD || '';

  return `<ENVELOPE>
<HEADER>
<TALLYREQUEST>Export Data</TALLYREQUEST>
</HEADER>
<BODY>
<EXPORTDATA>
<REQUESTDESC>
<REPORTNAME>List of Accounts</REPORTNAME>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
${safeCompany ? `<SVCURRENTCOMPANY>${safeCompany}</SVCURRENTCOMPANY>` : ''}
${username ? `<SVUSER>${escapeXml(username)}</SVUSER>` : ''}
${password ? `<SVPASSWORD>${escapeXml(password)}</SVPASSWORD>` : ''}
</STATICVARIABLES>
</REQUESTDESC>
</EXPORTDATA>
</BODY>
</ENVELOPE>`;
}

function buildInvoiceRequest(fromDate, toDate, companyName) {
  const from = fromDate || '20250401';
  const to = toDate || '20260331';
  const safeCompany = companyName ? escapeXml(companyName) : '';
  const username = process.env.TALLY_USERNAME || '';
  const password = process.env.TALLY_PASSWORD || '';

  return `<ENVELOPE>
<HEADER>
<TALLYREQUEST>Export Data</TALLYREQUEST>
</HEADER>
<BODY>
<EXPORTDATA>
<REQUESTDESC>
<REPORTNAME>Sales Register</REPORTNAME>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
<SVFROMDATE>${from}</SVFROMDATE>
<SVTODATE>${to}</SVTODATE>
${safeCompany ? `<SVCURRENTCOMPANY>${safeCompany}</SVCURRENTCOMPANY>` : ''}
${username ? `<SVUSER>${escapeXml(username)}</SVUSER>` : ''}
${password ? `<SVPASSWORD>${escapeXml(password)}</SVPASSWORD>` : ''}
</STATICVARIABLES>
</REQUESTDESC>
</EXPORTDATA>
</BODY>
</ENVELOPE>`;
}

function buildPingRequest() {
  return `<ENVELOPE>
<HEADER>
<TALLYREQUEST>Export Data</TALLYREQUEST>
</HEADER>
<BODY>
<EXPORTDATA>
<REQUESTDESC>
<REPORTNAME>List of Companies</REPORTNAME>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
</STATICVARIABLES>
</REQUESTDESC>
</EXPORTDATA>
</BODY>
</ENVELOPE>`;
}

function buildVoucherRequest(companyName, fromDate, toDate) {
  const safeCompany = companyName ? escapeXml(companyName) : '';
  const username = process.env.TALLY_USERNAME || '';
  const password = process.env.TALLY_PASSWORD || '';

  const from = fromDate || '20250401';
  const to = toDate || '20260331';

  console.log(`Fetching Day Book from ${from} to ${to}...`);

  return `<ENVELOPE>
<HEADER>
<TALLYREQUEST>Export Data</TALLYREQUEST>
</HEADER>
<BODY>
<EXPORTDATA>
<REQUESTDESC>
<REPORTNAME>Day Book</REPORTNAME>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
<SVFROMDATE>${from}</SVFROMDATE>
<SVTODATE>${to}</SVTODATE>
${safeCompany ? `<SVCURRENTCOMPANY>${safeCompany}</SVCURRENTCOMPANY>` : ''}
${username ? `<SVUSER>${escapeXml(username)}</SVUSER>` : ''}
${password ? `<SVPASSWORD>${escapeXml(password)}</SVPASSWORD>` : ''}
</STATICVARIABLES>
</REQUESTDESC>
</EXPORTDATA>
</BODY>
</ENVELOPE>`;
}


module.exports = {
  buildCustomerRequest,
  buildStockRequest,
  buildInvoiceRequest,
  buildVoucherRequest,
  buildPingRequest,
};
