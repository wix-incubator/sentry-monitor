const {getSentryDataByProject, processSentryDataForProject} = require('./sentry');
const opts = { };

const getConstants = ({SENTRY_AUTH, ANODOT_AUTH, NEW_RELIC_AUTH, NEW_RELIC_ACCOUNT_ID, org, projects}) => {
  const SENTRY_URL = 'https://sentry.io/api/0/';
  const NEW_RELIC_URL = `https://insights-collector.newrelic.com/v1/accounts/${NEW_RELIC_ACCOUNT_ID}/events`;
  const ANODOT_URL = `https://api.anodot.com/api/v1/metrics?token=${ANODOT_AUTH}&protocol=anodot20`;
  const HOUR = 3600 * 1000;
  const INTERVAL = HOUR / 12;
  const PAGINATION_RECURSION_LIMIT = 1000; //just in case

  return {
    SENTRY_URL,
    SENTRY_AUTH,
    ANODOT_URL,
    NEW_RELIC_URL,
    NEW_RELIC_AUTH,
    HOUR,
    INTERVAL,
    PAGINATION_RECURSION_LIMIT,
    org,
    projects,
  };
};

const run = ({debug = false, config} = {}) => {
  return Promise.resolve().then(() => {
    if (!config) {
      throw new Error('No config!');
    }
    opts.constants = getConstants(config);
    const endTime = new Date().getTime();
    const startTime = endTime - opts.constants.INTERVAL;
    console.info(`--------------------------------------------------------`);
    console.info(`Beginning task for range: ${new Date(startTime)} - ${new Date(endTime)}`);
    const {projects} = opts.constants;

    return Promise.all(
      projects
        .map(({project, filters}) =>
          getSentryDataByProject({startTime, endTime, project, filters, opts})
            .then(data => processSentryDataForProject({data, debug, project, opts}))
        )
    );
  });

};

module.exports = run;