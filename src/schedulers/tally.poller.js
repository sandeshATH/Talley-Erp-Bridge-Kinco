const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { fetchInvoices } = require('../services/tally.service');

const statePath = path.join(__dirname, '../../data/lastProcessed.json');

function readState() {
  try {
    const raw = fs.readFileSync(statePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { lastProcessedInvoiceDate: null };
  }
}

function writeState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function getLatestDate(invoices) {
  const dates = invoices.map((i) => i.date).filter(Boolean);
  if (!dates.length) return null;
  dates.sort();
  return dates[dates.length - 1];
}

async function pollTally() {
  try {
    const state = readState();
    const fromDate = state.lastProcessedInvoiceDate || null;
    const invoices = await fetchInvoices({ fromDate });

    const newInvoices = fromDate
      ? invoices.filter((i) => i.date && i.date > fromDate)
      : invoices;

    if (newInvoices.length) {
      // Placeholder for WhatsApp/AI trigger
      console.log(`New invoices: ${newInvoices.length}`);
    }

    const latestDate = getLatestDate(invoices);
    if (latestDate && latestDate !== state.lastProcessedInvoiceDate) {
      writeState({ lastProcessedInvoiceDate: latestDate });
    }
  } catch (error) {
    console.error('Tally poller error:', error.message);
  }
}

function startTallyPoller() {
  // Every 2 minutes
  cron.schedule('*/2 * * * *', pollTally);
}

module.exports = {
  startTallyPoller,
};
