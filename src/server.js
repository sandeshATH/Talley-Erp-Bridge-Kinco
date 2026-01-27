const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { startTallyPoller } = require('./schedulers/tally.poller');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

startTallyPoller();
