const app = require('express')();
const run = require('./sentry-monitor');

module.exports = function(config) {
  app.route('/')
    .post((req, res) => {
      run({debug: req.query.debug, config});
      res.sendStatus(200);
    });

  app.listen(3000, () => {
    console.log('Listening on localhost:3000');
  });

}

/*

const config = {
  SENTRY_AUTH,
  NEW_RELIC_AUTH,
  NEW_RELIC_ACCOUNT_ID,
  ANODOT_AUTH,
  org: '',
  project: '',
  filters: [
    {
      name: '',
      searchTerms: ['', '']
    }
  ]
};




 */