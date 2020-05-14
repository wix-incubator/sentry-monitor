const fetch = require('node-fetch');
const fs = require('fs')
var project = "DF"
//var text = "test jira api"
function checkForIssue(sentryId,JIRA_AUTH) {
  const bodyData = {
    "expand": [
      "names"
    ],
    "jql": `project = DF AND description ~ "id:${sentryId}" ORDER BY priority DESC`,
    "maxResults": 50,
    "fieldsByKeys": false,
    "fields": [
      "summary",
      "status",
      "assignee"
    ],
    "startAt": 0
  };

  return fetch('https://naspersclassifieds.atlassian.net/rest/api/3/search', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(
        JIRA_AUTH
      ).toString('base64')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  })
}


const jiraIssueCheck = async function (data,JIRA_AUTH) {
  try{
    let response = await checkForIssue(data.sentryId,JIRA_AUTH)
    let body = await response.json()
    return body.issues
  }catch(err){
    console.log('ERROR in fetching issues related to the sentry data')
    console.log(err)
  }
} 

module.exports = {
  jiraIssueCheck
}