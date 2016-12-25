const {ANODOT_AUTH, NEW_RELIC_AUTH, NEW_RELIC_ACCOUNT_ID, SENTRY_AUTH} = require('./config.private');
module.exports = {
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

