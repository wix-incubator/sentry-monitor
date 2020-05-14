
const fetch = require('node-fetch')

const createIssue = (jiraData,JIRA_AUTH) => {
  const bodyData = {
    "fields": {
      "project":
      {
        "key": "DF"
      },
      "description": {
        "version": 1,
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": `ID:${jiraData.sentryId}`,
                "marks": [
                  {
                    "type": "strong"
                  }
                ]
              },
              {
                "type": "hardBreak"
              },
              {
                "type": "text",
                "text": "Users:"
              },
              {
                "type": "text",
                "text": `${jiraData.count}`
              },
              {
                "type": "hardBreak"
              },
              {
                "type": "text",
                "text": "Link:"
              },
              {
                "type": "text",
                "text": `${jiraData.link}`,
                "marks": [
                  {
                    "type": "link",
                    "attrs": {
                      "href": `${jiraData.link}`,
                      "title": "Sentry link"
                    }
                  }
                ]
              },
              {
                "type": "hardBreak"
              },
              {
                "type": "text",
                "text": 'Issue:'
              }
            ]
          },
          {
            "type": "codeBlock",
            "attrs": {
              "language": "JSON"
            },
            "content": [
              {
                "type": "text",
                "text": `${jiraData.log}`
              }
            ]
          }
        ]
      },
      "priority": {
        "name": `${jiraData.priority}`
      },
      "summary": `${jiraData.title}`,
      "issuetype": {
        "name": "Bug"
      },
      "labels": [`sentry:${jiraData.project}`]
    }
  }

  return fetch('https://naspersclassifieds.atlassian.net/rest/api/3/issue/', {
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

module.exports = { createIssue }




