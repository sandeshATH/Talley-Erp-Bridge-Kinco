const axios = require('axios');
const xml2js = require('xml2js');
const { TALLY_URL } = require('../config/tally.config');
const { buildCustomerRequest, buildInvoiceRequest } = require('../utils/xml.builder');
const { mapCustomers, mapInvoices } = require('../utils/mapper');

const parser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true,
  trim: true,
});

async function postXml(xml) {
  try {
    const response = await axios.post(TALLY_URL, xml, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 15000,
    });

    const json = await parser.parseStringPromise(response.data);
    return json;
  } catch (error) {
    const message = error?.response?.data || error.message || 'Unknown error';
    throw new Error(`Tally request failed: ${message}`);
  }
}

async function fetchCustomers() {
  const xml = buildCustomerRequest();
  const json = await postXml(xml);
  return mapCustomers(json);
}

async function fetchInvoices({ fromDate, toDate } = {}) {
  const xml = buildInvoiceRequest(fromDate, toDate);
  const json = await postXml(xml);
  return mapInvoices(json);
}

module.exports = {
  fetchCustomers,
  fetchInvoices,
};
