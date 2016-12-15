const fetch = require('node-fetch');
const _ = require('lodash');
const parse = require('parse-link-header');
const {authorization, org, project, searchTerms} = require('./config');

const HOUR = 3600 * 1000;
const BASE_URL = 'https://sentry.io/api/0/';
const fetchOptions = {
  headers: {
    Authorization: authorization
  }
};

// const getData = query => fetch(`${BASE_URL}projects/${org}/${project}/issues/?query=is:unresolved%20${query}&statsPeriod=`, fetchOptions)
//     .then(res => res.json())

// const processData = issues => {
//     let totalCount = 0
//     console.log(issues[0])
//     issues.forEach(issue => {
//         getIssuesEvents(issue).then(events => {
//             console.log(issue.title, issue.permalink, _.filter(events, e => new Date(e.dateCreated) > startTime).length)
//         })
//         totalCount += parseInt(issue.count)
//     })
//     console.log(totalCount)
// } 


// const getIssuesEvents = issue => fetch(`${BASE_URL}issues/${issue.id}/events/`, fetchOptions)
//     .then(res => res.json())


// const getByIssue = () => Promise.all([
//     getData('inbox'),
//     getData('contact-card'),
//     getData('invoices')
// ]).then(results => {    
//     let all = [] 
//     results.forEach(result => {
//         all = [...result.slice(0, 5), ...all]
//     })
//     return all;
// }).then(data => {
//         processData(data)
//     })    

const getPage = url => fetch(url, fetchOptions)
  .then(res => res.json()
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
    console.error(ex);
    throw ex;
  });

const PAGINATION_RECURSION_LIMIT = 1000; //just in case

const getPagedData = (url, startDatetime, acc = [], datetimeField = 'dateCreated') => {
  console.log('Fetching page...');
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
      console.error('Failed to get page: ', url, ex);
      throw ex;
    });
  };

const endTime = new Date().getTime();
const startTime = endTime - (HOUR / 12);
const searchEventMessage = (event, searchTerms) => searchTerms.some(term => event.message.indexOf(term) !== -1);

getPagedData(`${BASE_URL}projects/${org}/${project}/events/`, startTime, [], 'dateCreated').then(data => {
  console.log(`Processing total of ${data.length} events in range`);
  const events = _.filter(data, e => searchEventMessage(e, searchTerms));
  const counts = _.countBy(events, 'groupID');
  const mapped = Object.keys(counts).map(groupID => ({
    groupID,
    count: counts[groupID],
    url: `https://sentry.io/${org}/${project}/issues/${groupID}/`,
    message: _.find(events, e => e.groupID === groupID).message,
  }));
  const result = {
    range: {
      start: startTime,
      end: endTime
    },
    totalEvents: events.length,
    errors: mapped
  };
  console.info(result);
  return result;
});
