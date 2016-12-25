const fetch = require('node-fetch');
const _ = require('lodash');
const parse = require('parse-link-header');
const {SENTRY_AUTH, ANODOT_AUTH, NEW_RELIC_AUTH, NEW_RELIC_ACCOUNT_ID, org, project, filters} = require('./config');

const SENTRY_URL = 'https://sentry.io/api/0/';
const NEW_RELIC_URL = `https://insights-collector.newrelic.com/v1/accounts/${NEW_RELIC_ACCOUNT_ID}/events`;
const ANODOT_URL = `https://api.anodot.com/api/v1/metrics?token=${ANODOT_AUTH}&protocol=anodot20`;
const HOUR = 3600 * 1000;
const INTERVAL = HOUR / 12;
const PAGINATION_RECURSION_LIMIT = 1000; //just in case


const getPage = url => fetch(url, {
  headers: {
    Authorization: SENTRY_AUTH
  }
}).then(res => res.json()
    .then(data => {
      if (!res.ok) {
        throw new Error(`Status ${res.status} on ${url}: ${data.detail}`);
      }
      const {next} = parse(res.headers.get('link'));
      return {
        nextUrl: next.results === 'true' ? next.url : null,
        data
      };
    }))
  .catch(ex => {
    console.error('Failed to get page: ', url, ex);
    throw ex;
  });


const getPagedData = (url, startDatetime, acc = [], datetimeField = 'dateCreated') => {
  console.log(`Fetching page, url: ${url}...`);
  return getPage(url)
    .then(result => {
      let {data, nextUrl} = result;
      let stop;
      //TODO: is the assumption that data is order by the datetimeField desc correct?
      if (new Date(data[data.length - 1][datetimeField]) < startDatetime) {
        data = _.filter(result.data, item => new Date(item[datetimeField]) > startDatetime);
        stop = true;
      }
      acc = [...acc, ...data];
      if (nextUrl && acc.length < PAGINATION_RECURSION_LIMIT && !stop) {
        return getPagedData(nextUrl, startDatetime, acc, datetimeField);
      } else {
        return acc;
      }
    })
    .catch(ex => {
      console.error('Failed to get data: ', url, ex);
      throw ex;
    });
};

const searchEventMessage = (event, searchTerms) => searchTerms.some(term => event.message.indexOf(term) !== -1);

const getSentryData = (startTime, endTime) =>
  getPagedData(`${SENTRY_URL}projects/${org}/${project}/events/`, startTime, [], 'dateCreated')
    .then(data => {
      console.info(`Processing total of ${data.length} events in range`);
      const results = [];
      filters.forEach(filter => {
        const events = _.filter(data, e => searchEventMessage(e, filter.searchTerms));
        const counts = _.countBy(events, 'groupID');
        const mapped = Object.keys(counts).map(groupID => ({
          groupID,
          count: counts[groupID],
          url: `https://sentry.io/${org}/${project}/issues/${groupID}/`,
          message: _.find(events, e => e.groupID === groupID).message,
        }));
        console.info(`Found ${events.length} events in ${mapped.length} issues`);

        results.push({
          range: {
            start: startTime,
            end: endTime
          },
          filterName: filter.name,
          totalEvents: events.length,
          errors: mapped
        });
      });

      return results;
    })
    .catch(ex => {
      console.error('Failed to get Sentry events properly');
      throw ex;
    });

const formatDataForAnodot = data => {
  return data.map(filterResults => ({
    properties: {
      what: "sentry_events",
      project: 'WOA',
      filter: filterResults.filterName,
      type: 'event_count',
      target_type: "counter"
    },
    timestamp: filterResults.range.end / 1000,
    value: filterResults.totalEvents
  }));
};

const formatDataForNewRelic = data => {
  const formatted = [];
  data.forEach(filterResults => {
    const filter = filterResults.filterName;
    formatted.push({
      eventType: 'SentryMonitoring',
      project: 'WOA',
      filter,
      type: 'event_count',
      value: filterResults.totalEvents
    });

    filterResults.errors.forEach(error => {
      formatted.push({
        eventType: 'SentryMonitoring',
        project: 'WOA',
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

const handleDataUploadResponse = (res, destination) => {
  if (!res.ok) {
    console.error(`${res.status} Error sending data to ${destination}`);
    throw new Error(res);
  } else {
    console.log(`Successfully sent data to ${destination}`);
  }
};

const sendDataToNewRelic = data => fetch(NEW_RELIC_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Insert-Key': NEW_RELIC_AUTH
  },
  body: JSON.stringify(formatDataForNewRelic(data))
}).then(res => handleDataUploadResponse(res, 'New Relic'));

const sendDataToAnodot = data => fetch(ANODOT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formatDataForAnodot(data))
}).then(res => handleDataUploadResponse(res, 'Anodot'));

const run = ({debug = false} = {}) => {
  const endTime = new Date().getTime();
  const startTime = endTime - INTERVAL;
  console.info(`--------------------------------------------------------`);
  console.info(`Beginning task for range: ${new Date(startTime)} - ${new Date(endTime)}`);
  getSentryData(startTime, endTime)
    .then(data => {
      if (debug) {
        console.log('Debug Mode: not sending any data anywhere...');
        console.log('NR Data: ');
        console.log(formatDataForNewRelic(data));
        console.log('Anodot Data: ');
        console.log(formatDataForAnodot(data));
      } else {
        return Promise.all([
          sendDataToAnodot(data),
          sendDataToNewRelic(data)
        ]);
      }
    })
    .catch(ex => console.error(ex));
};

module.exports = run;