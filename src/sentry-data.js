const _ = require('lodash');
const fetch = require('node-fetch');
const parse = require('parse-link-header');
const {formatDataForNewRelic, sendDataToNewRelic} = require('./new-relic');
const {formatDataForAnodot, sendDataToAnodot} = require('./anodot');


const getSentryDataByProject = ({startTime, endTime, project, filters, opts}) =>
  getPagedData(`${opts.constants.SENTRY_URL}projects/${opts.constants.org}/${project}/events/`, startTime, [], 'dateCreated', opts.constants.PAGINATION_RECURSION_LIMIT, opts.constants.SENTRY_AUTH)
    .then(data => {
      console.info(`Processing total of ${data.length} events in range`);
      const results = [];
      filters.forEach(filter => {
        const events = _.filter(data, e => searchEventMessage(e, filter.searchTerms));
        const counts = _.countBy(events, 'groupID');
        const mapped = Object.keys(counts).map(groupID => ({
          groupID,
          count: counts[groupID],
          url: `https://sentry.io/${opts.constants.org}/${opts.constants.project}/issues/${groupID}/`,
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


const getPagedData = (url, startDatetime, acc = [], datetimeField = 'dateCreated', PAGINATION_RECURSION_LIMIT, SENTRY_AUTH) => {
  console.log(`Fetching page, url: ${url}...`);
  return getPage(url, SENTRY_AUTH)
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


const getPage = (url, SENTRY_AUTH) => fetch(url, {
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

const processSentryDataForProject = ({data, debug, project, opts}) => {
  const newRelicData = formatDataForNewRelic(data, project);
  const anodotData = formatDataForAnodot(data, project);
  if (debug) {
    console.log('Debug Mode: not sending any data anywhere...');
    console.log('NR Data: ');
    console.log(newRelicData);
    console.log('Anodot Data: ');
    console.log(anodotData);
    return {
      newRelicData,
      anodotData
    };
  } else {
    return Promise.all([
      sendDataToAnodot(anodotData, opts),
      sendDataToNewRelic(newRelicData, opts)
    ]);
  }
};

const searchEventMessage = (event, searchTerms) => searchTerms.some(term => event.message.indexOf(term) !== -1);

module.exports = {
  getSentryDataByProject,
  processSentryDataForProject
};