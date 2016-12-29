# 🖥 Sentry Monitor

## Big Idea

A job runs every five minutes that reviews all [Sentry](https://sentry.io) events in the last five minutes, and filters to those that meet 
some predetermined search criteria. 
The data is then summarized nicely and sent to [New Relic](https://newrelic.com) and [Anodot](https://anodot.com) so that you can build dashboards and configure anomaly detection.

For more discussion of the how and why, see [this blog post](http://www.aarongreenwald.com/blog/sentry-new-relic-anodot-integration). 

## The Basic Mechanism

The main artifact of this repo is a web server with a single endpoint. A cron job should `POST` to this endpoint
once every five minutes, triggering the job. The job will query Sentry, process the data, and report it to New Relic and Anodot. This (sometimes thought of as convoluted) architecture allows the service to be deployed on any number of servers with failover 
support and allows it to be safely restarted.

## Some Vocabulary

Your Sentry account is called an *organization* (`org`). Within it, you have any number of `project`s, which hold untold numbers of `events` that are grouped into `issues`. You might have only one project if you have only one application, or you might have several if you work for a large company with lots of different product offerings. The issue grouping is based on Sentry's algorithm that attempts to group similar events so that you can get an idea of how common a bug is, etc.

Sentry Monitor is configured with a list of projects and their associated `filters`. Each filter contains an array of `searchTerms`. The projects are your Sentry projects, and the filters are ways to reduce the overload of events and group them into areas. For example, you might have a filter called `ui` that contains `searchTerms: ['module_1', 'component_x']` because the UI developer(s) on your team are particularly interested in monitoring events that have `module_1` or `component_x` in their text (because Sentry events contain the stack trace, this is an easy way to filter by location in the source). You might have another filter called `infra` and another filter `all` for a broad overview. (They can overlap, each filter will contain all the data that matches its search terms. For the `all` filter, just pass an empty string as the only item in the `searchTerms` array). 

## What You End Up With 

For each project/filter, the following data is reported to New Relic every five minutes. The data will be available for querying in the Insights application under the type `SentryMonitoring`.

1. Total Event Count: Number of events that occurred in the last five minutes that meet the filter criteria
1. Sentry issues that occurred in the last five minutes
along with a link to Sentry, a description, and the number of actual events that occurred in the last five minutes matching this issue.

For each project/filter, the following data is reported to Anodot every five minutes:

1. Total Event Count: Number of events that occurred in the last five minutes that meet the filter criteria

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
