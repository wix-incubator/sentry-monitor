const _ = require('lodash');
const fetch = require('node-fetch');
const parse = require('parse-link-header');
const {formatDataForNewRelic, sendDataToNewRelic} = require('./new-relic');
const {formatDataForAnodot, sendDataToAnodot} = require('./anodot');

const searchEventMessage = (event, searchTerms) => searchTerms.some(term => event.message.indexOf(term) !== -1);

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

const getPagedData = ({url, startTime, acc = [], opts, datetimeField = 'dateCreated'}) => {
  console.log(`Fetching page, url: ${url}...`);
  const {PAGINATION_RECURSION_LIMIT, SENTRY_AUTH} = opts.constants;
  return getPage(url, SENTRY_AUTH)
    .then(result => {
      let {data, nextUrl} = result;
      let stop;
      //TODO: is the assumption that data is order by the datetimeField desc correct?
      if (new Date(data[data.length - 1][datetimeField]) < startTime) {
        data = _.filter(result.data, item => new Date(item[datetimeField]) > startTime);
        stop = true;
      }
      acc = [...acc, ...data];
      if (nextUrl && acc.length < PAGINATION_RECURSION_LIMIT && !stop) {
        return getPagedData({url: nextUrl, startTime, acc, opts});
      } else {
        return acc;
      }
    })
    .catch(ex => {
      console.error('Failed to get data: ', url, ex);
      throw ex;
    });
};

const getSentryDataByProject = ({startTime, endTime, project, filters, opts}) =>
  getPagedData({url: `${opts.constants.SENTRY_URL}projects/${opts.constants.org}/${project}/events/`, startTime, acc: [], opts})
    .then(data => {
      console.info(`Processing total of ${data.length} events in range`);
      const results = [];

      filters.forEach(filter => {
        const {events, errors} = processFilter({filter, data, opts, project});
        console.info(`Found ${events.length} events in ${errors.length} issues for project ${project}, filter ${filter.name}`);
        results.push({
          range: {
            start: startTime,
            end: endTime
          },
          filterName: filter.name,
          totalEvents: events.length,
          errors
        });
      });

      return results;
    })
    .catch(ex => {
      console.error('Failed to get Sentry events properly');
      throw ex;
    });



const processFilter = ({filter, data, opts, project}) => {
  const events = _.filter(data, e => searchEventMessage(e, filter.searchTerms));
  const countsByGroup = groupAndCount(events, filter.tags);
  const errors = errorsByGroup({events, countsByGroup, opts, project, filter});
  return {events, errors};
};

const groupAndCount = (events, groupByTags = []) => _.countBy(events, event => {
  const tagValues = groupByTags.map(tagKey => {
    const tag = _.find(event.tags, tag => tag.key === tagKey);
    return tag ? tag.value : null;
  });
  return `${event.groupID}_${tagValues.join('_')}`;
});

const errorsByGroup = ({events, countsByGroup, opts, project, filter}) => Object.keys(countsByGroup).map(groupKey => {
  const [groupID, ...tagValues] = groupKey.split('_');

  const tags = filter.tags && filter.tags.reduce((acc, tag, i) => Object.assign(acc, {
    [tag]: tagValues[i]
  }), {});

  return {
    groupID,
    count: countsByGroup[groupKey],
    tags,
    url: `https://sentry.io/${opts.constants.org}/${project}/issues/${groupID}/`,
    message: _.find(events, e => e.groupID === groupID).message,
  };
});

const processSentryDataForProject = ({data, debug, project, opts}) => {
  const newRelicData = formatDataForNewRelic(data, project);
  const anodotData = formatDataForAnodot(data, project);
  if (debug) {
    // console.log('Debug Mode: not sending any data anywhere...');
    // console.log('NR Data: ');
    // console.log(newRelicData);
    // console.log('Anodot Data: ');
    // console.log(anodotData);
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

module.exports = {
  getSentryDataByProject,
  processSentryDataForProject
};