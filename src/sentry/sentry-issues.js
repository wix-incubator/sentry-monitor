const querystring = require('querystring');
const fetch = require('node-fetch')
// parameters for the url search

function getIssues(project,SENTRY_AUTH) {
    let params = {
        is: 'unresolved',
        lastSeen: '-3h'
    }
    let urlEncodedParams = querystring.stringify(params, '+', '%3A');
    let issuesUrl = `https://sentry.io/api/0/projects/dubizzle-uae/${project}/issues/?query=${urlEncodedParams}`

    return fetch(issuesUrl, {
        method: 'GET',
        headers: {
            'Authorization': SENTRY_AUTH,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
}

const sentryRunner = async (project, SENTRY_AUTH) => {
    try {
        let res = await getIssues(project,SENTRY_AUTH)
        let data = await res.json()
        console.log('RESPONSE STATUS:', res.status)
        return data
    } catch (err) {
        console.log('------------------Caught exception during sentry api call------------------')
        console.log(err)
    }
}

exports = module.exports = {
    sentryRunner
}





