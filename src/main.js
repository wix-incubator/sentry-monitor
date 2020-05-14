const {sentryRunner} = require('./sentry/sentry-issues.js')
const {jiraHandler} = require('./jira/jirahandler.js')


const jiraReporter = async function (metadata){
    try{
        for (_project of metadata.projects){
            const data = await sentryRunner(_project.project,metadata.SENTRY_AUTH)
            jiraHandler(data,metadata.JIRA_AUTH)
        }
        
    } catch (err) {
        console.log (err)
    }

}

module.exports = {jiraReporter}
