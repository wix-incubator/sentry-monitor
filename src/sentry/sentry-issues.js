const querystring = require('querystring');
const fetch = require('node-fetch')
// parameters for the url search

function getIssues(project,SENTRY_AUTH) {
    let params = {
        is: 'unresolved',
        lastSeen: '-3h'
    }
    //let auth = 'Bearer  b6361f38b1b74816b723082aa374ee16f66fdbea63934f719dc920a9131b35d7'
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
        //console.log('I AM RUNNING')
        //console.log("RESPONSE OBJECT:",res)
        //console.log('---------------------------------------------------------------------------')
        //console.log('RESPONSE BODY:',data)
        return data
    } catch (err) {
        console.log('------------------Caught exception during sentry api call------------------')
        console.log(err)
        //throw Error
    }
}

exports = module.exports = {
    sentryRunner
}





