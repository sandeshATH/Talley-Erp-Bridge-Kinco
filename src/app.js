const express = require('express');
const customerRoutes = require('./routes/customer.routes');
const invoiceRoutes = require('./routes/invoice.routes');

const app = express();

app.use(express.json());

app.use('/api', customerRoutes);
app.use('/api', invoiceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
