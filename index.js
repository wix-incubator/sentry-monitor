const app = require('express')();
const run = require('./sentry-monitor');

module.exports = function(config) {

  app.use((req, res, next) => {
    if (config.WSM_AUTH_KEY && req.headers['x-wsm_auth_key'] !== config.WSM_AUTH_KEY) {
      console.log(`Request denied from ${req.ip}`, req.headers);
      return res.sendStatus(403);
    }
    next();
  });

  app.route('/')
    .post((req, res) => {
      run({debug: req.query.debug, config})
        .then(data => res.send(req.query.debug ? data : {}))
        .catch(ex => {
          console.error(ex);
          res.status(500);
          res.send(ex);
        });
    });

  return app;
};

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