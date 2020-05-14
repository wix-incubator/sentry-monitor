// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch');


const getIssue = (key,JIRA_AUTH) =>{
  return fetch(`https://naspersclassifieds.atlassian.net/rest/api/3/issue/${key}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(
        JIRA_AUTH
      ).toString('base64')}`,
      'Accept': 'application/json'
    }
  })
}

module.exports={getIssue}