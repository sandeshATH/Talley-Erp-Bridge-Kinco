const express = require('express');
const path = require('path');
const cors = require('cors');
const requireApiKey = require('./middleware/auth.middleware');
const customerRoutes = require('./routes/customer.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const stockRoutes = require('./routes/stock.routes');
const voucherRoutes = require('./routes/voucher.routes');
const testRoutes = require('./routes/test.routes');

const app = express();

let publicUrl = null;
app.setPublicUrl = (url) => { publicUrl = url; };

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.get('/api/config', (req, res) => {
  res.json({
    tallyHost: process.env.TALLY_HOST || '127.0.0.1',
    tallyPort: process.env.TALLY_PORT || '9011',
    company: process.env.TALLY_COMPANY || 'Not set',
    serverPort: process.env.PORT || '3000',
    ngrokEnabled: process.env.ENABLE_NGROK === 'true',
    publicUrl,
  });
});

app.use('/api', requireApiKey);
app.use('/api/test-reports', testRoutes);
app.use('/api', customerRoutes);
app.use('/api', invoiceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/vouchers', voucherRoutes);

module.exports = app;
