const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { startTallyPoller } = require('./schedulers/tally.poller');
const { pingTally } = require('./services/tally.service');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
});

pingTally()
  .then(() => console.log('Tally connectivity: OK'))
  .catch((error) => console.error('Tally connectivity: FAILED', error.message));

startTallyPoller();

if (process.env.ENABLE_NGROK === 'true') {
  const ngrok = require('@ngrok/ngrok');
  ngrok.connect({
    addr: PORT,
    authtoken: process.env.NGROK_AUTHTOKEN,
  }).then(listener => {
    const url = listener.url();
    app.setPublicUrl(url);
    console.log('');
    console.log('=================================');
    console.log('PUBLIC URL (share with AI):');
    console.log(url);
    console.log('=================================');
    console.log('');
  }).catch(err => {
    console.error('ngrok failed to connect:', err.message);
  });
}
