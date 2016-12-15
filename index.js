
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

const getPage = url => {
    return fetch(url, fetchOptions)        
        .then(res => {
            const {next} = parse(res.headers.get('link'));
            return res.json().then(data => ({
                next: next.results === 'true' ? next.url : null,
                data
            })                        
        )
    })
}

const getPagedData = (url, earliest, existing = []) => {
    const max = 1000; //just in case
    console.log('fetching page')
    return getPage(url)    
        .then(result => {
            let {data} = result;
            let stop;
            if (new Date(data[data.length - 1].dateCreated) < earliest) {
                data = _.filter(result.data, e => new Date(e.dateCreated) > earliest)
                stop = true;
            }
            existing = [...existing, ...data]
            if (result.next && existing.length < max && !stop) {
                return getPagedData(result.next, earliest, existing)
            } else {
                return existing;
            }
                    
        })    
    }

const endTime = new Date().getTime();
const startTime = endTime - (HOUR / 12);
const search = (e, searchTerms) => searchTerms.some(term => e.message.indexOf(term) !== -1);
getPagedData(`${BASE_URL}projects/${org}/${project}/events/`, startTime).then(data => {
    //get events in last five minutes, filter to interesting ones
    console.log(`processing ${data.length} events`)
    const events = _.filter(data, e => search(e, searchTerms))
    const counts = _.countBy(events, 'groupID')
    const mapped = Object.keys(counts).map(groupID => ({
        groupID,    
        count: counts[groupID], 
        url: `https://sentry.io/${org}/${project}/issues/${groupID}/`,
        message: _.find(events, e => e.groupID === groupID).message,
    }))
    console.info('Range: ', new Date(startTime), new Date(endTime))
    console.info('Total Event Count:', events.length)
    console.info('Issues', mapped)
})