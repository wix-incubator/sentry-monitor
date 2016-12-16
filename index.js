const app = require('express')();
const runSentryMonitor = require('./sentry-monitor');

app.route('/')
  .post((req, res) => {
    runSentryMonitor({debug: req.query.debug});
    res.sendStatus(200);
  });

app.listen(3000, () => {
  console.log('Listening on localhost:3000');
});