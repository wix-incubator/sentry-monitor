const {handleDataUploadResponse} = require('./util');

const formatDataForAnodot = (data, project) => {
  return data.map(filterResults => ({
    properties: {
      what: 'sentry_events',
      project,
      filter: filterResults.filterName,
      type: 'event_count',
      target_type: 'counter' //eslint-disable-line camelcase
    },
    timestamp: filterResults.range.end / 1000,
    value: filterResults.totalEvents
  }));
};

const sendDataToAnodot = data => fetch(opts.constants.ANODOT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
}).then(res => handleDataUploadResponse(res, 'Anodot'));


module.exports = {
  formatDataForAnodot,
  sendDataToAnodot
};
