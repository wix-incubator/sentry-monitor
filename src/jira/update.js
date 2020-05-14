const fetch = require('node-fetch')


// let content = [
//     {
//         "type": "paragraph",
//         "content": [
//             {
//                 "type": "text",
//                 "text": "Hello"
//             },
//             {
//                 "type": "text",
//                 "text": "World",
//                 "marks": [
//                     {
//                         "type": "strong"
//                     }
//                 ]
//             }
//         ]
//     },
//     {
//         "type": "paragraph",
//         "content": [
//             {
//                 "type": "text",
//                 "text": `{
//                     type: 'UnhandledRejection',
//                     value: '{"promise":{"_c":[],"_a":[],"_s":2,"_d":true,"_v":"[undefined]","_h":0,"_n":false},"reason":"[undefined]"}'
//                   }`
//             }
//         ]
//     }
// ]




const issueUpdate = (updateData, { count, priority },JIRA_AUTH) => {
    let auth = 'mirza.ali-int@dubizzle.com:DLcLf0SiUXV9w1BXqJdp4F35'
    updateData.fields.priority.name = priority
    updateData.fields.description.content[0].content[3].text = count.toString() 
    let bodyData = {
        "fields": {
            "description":updateData.fields.description,
            "priority": {
                "name":priority,
            }
        }
    }
    
   return fetch(`https://naspersclassifieds.atlassian.net/rest/api/3/issue/${updateData.key}`, {
        method: 'PUT',
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

module.exports = {issueUpdate}












// .then(response => {
    //     console.log(
    //         `Response: ${response.status} ${response.statusText}`
    //     );
    //     return response.text();
    // })
    // .then(text => console.log(text))
    // .catch(err => console.error(err));



    // let bodyData = {
    //     "fields" : {
    //         "description": {
    //             "version": 1,
    //             "type": "doc",
    //             "content": [
    //               {
    //                 "type": "paragraph",
    //                 "content": [
    //                   {
    //                     "type": "text",
    //                     "text": "Hello"
    //                   },
    //                   {
    //                     "type": "text",
    //                     "text": "World",
    //                     "marks": [
    //                       {
    //                         "type": "strong"
    //                       }
    //                     ]
    //                   }
    //                 ]
    //               }
    //             ]
    //         },
    //         "priority":{
    //             "name":"Highest"
    //         }
    //     }

    // }