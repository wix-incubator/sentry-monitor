# sentry-monitor

## Big Idea

A job runs every five minutes that reviews all Sentry events in the last five minutes, and filters to those that meet 
some predetermined search criteria. 
The data is then summarized nicely and sent to New Relic and Anodot, where we can build dashboards and anomaly detection.

For more discussion of the how and why, see [this blog post](http://www.aarongreenwald.com/blog/sentry-new-relic-anodot-integration)

## The Basic Mechanism

The main artifact of this repo is a web server with a single endpoint. A cron job should `POST` to this endpoint
once every five minutes, triggering the job. This architecture allows it to be deployed on any number of servers with failover 
support and allows it to be safely restarted.

## What You End Up With 

For each filter:

1. Total Event Count: Number of events that occurred in the last five minutes that meet the criteria
1. Sentry issues (groups of events that Sentry considers to be the same problem) that occurred in the last five minutes
along with a link to Sentry, a description, and the number of actual events that occurred in the last five minutes matching this issue.
(This data is not sent to Anodot.)

## Usage

You'll need a webserver to run the job. Any old node server will do for a minimal implementation. 
Once you have a project, `npm install sentry-monitor` to get started. In your `index.js`, add:

```js

const monitor = require('sentry-monitor');


const config = {
  SENTRY_AUTH: 'auth_token_for_sentry_api',
  NEW_RELIC_AUTH: 'new_relic_insert_key',
  NEW_RELIC_ACCOUNT_ID: 'this_is_your_nr_account_id',
  ANODOT_AUTH: 'auth_token_for_anodot_api',
  WSM_AUTH_KEY: 'optional_secret_key',
  org: 'your_sentry_org_name',
  project: 'your_sentry_project_name',
  filters: [
    {
      name: 'MyFilter',
      searchTerms: ['items I want to see', 'MORE_ITEMS']
    }
  ]
};


const app = monitor(config);
app.listen(3000, () => console.log('Listening on port 3000'));


```

Now set up a cron job that posts to this server every five minutes and you're done! 

To run locally: clone, `npm install`, and set the auth tokens and such in a private config file. 
To generate an auth token for your Sentry account, visit [https://sentry.io/api/](https://sentry.io/api/). 

**Warning:** If you test it locally, you could be sending data to NR and Anodot when you don't mean to, which will mess up 
your charts. Add a query parameter `debug=true` to the your HTTP requests so that data isn't sent and instead is logged to the console.

## Multiple Projects

If you have more than one project in your organization, you can monitor all of them by sending an array of projects
instead of just one: 

```js

const config = {
  ...config,
  org: 'your_sentry_org_name',
  projects: [
    {
      project: 'your_sentry_project_name',
      filters: [
        {
          name: 'MyFilter',
          searchTerms: ['items I want to see', 'MORE_ITEMS']
        }
      ]
    },
    {
      project: 'another_project',
      filters: [
        {
          name: 'SecondProjectsFilter',
          searchTerms: ['items I want to see', 'MORE_ITEMS']
        }
      ]
    }
  ],
};

```