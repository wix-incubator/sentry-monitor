const fetch = require('node-fetch');

jiraData = {
  sentryId: '1554194665',
  original: 'Error: undefined',
  title: 'Error: undefined',
  count: 1229,
  project: 'Monolith PAA',
  log: '{"type":"Error","value":"undefined"}',
  link: 'https://sentry.io/organizations/dubizzle-uae/issues/1554194665/',
  priority: 'Critical'
}
jiraData.project = jiraData.project.replace(/\s/,"-")
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


fetch('https://naspersclassifieds.atlassian.net/rest/api/3/issue/', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      'mirza.ali-int@dubizzle.com:DLcLf0SiUXV9w1BXqJdp4F35'
    ).toString('base64')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bodyData)
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    return response.json();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));

