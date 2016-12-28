const {handleDataUploadResponse} = require('./util');

const formatDataForNewRelic = (data, project) => {
  const formatted = [];
  data.forEach(filterResults => {
    const filter = filterResults.filterName;
    formatted.push({
      eventType: 'SentryMonitoring',
      project,
      filter,
      type: 'event_count',
      value: filterResults.totalEvents
    });

    filterResults.errors.forEach(error => {
      formatted.push({
        eventType: 'SentryMonitoring',
        project,
        filter,
        type: 'sentry_issue',
        sentryIssueId: error.groupID,
        sentryUrl: error.url,
        message: error.message,
        count: error.count
      });
    });
  });
  return formatted;
};

const sendDataToNewRelic = (data, opts) => fetch(opts.constants.NEW_RELIC_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Insert-Key': opts.constants.NEW_RELIC_AUTH
  },
  body: JSON.stringify(data)
}).then(res => handleDataUploadResponse(res, 'New Relic'));

module.exports = {
  formatDataForNewRelic,
  sendDataToNewRelic
};
