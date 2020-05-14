const fetch = require('node-fetch');

const bodyData = `{
  "jqls": [
    "project = FD",
    "issuetype = "Bug"
  ]
}`;

// fetch('https://naspersclassifieds.atlassian.net/rest/api/3/search?jql=project%20%3D%20DF%20%20AND%20key%20%3D%20DF-106%20order%20by%20created%20DESC', {
//   method: 'GET',
//   headers: {
//     'Authorization': `Basic ${Buffer.from(
//       'mirza.ali-int@dubizzle.com:DLcLf0SiUXV9w1BXqJdp4F35'
//     ).toString('base64')}`,
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   },
// })
//   .then(response => {
//     console.log(
//       `Response: ${response.status} ${response.statusText}`
//     );
//     return response.json();
//   })
//   .then(text => console.log(text))
//   .catch(err => console.error(err));