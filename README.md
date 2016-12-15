# sentry-monitor - POC WIP

## Big Idea

Every five minutes (or something like that), the job should run, check all events in the last five minutes, and filter to those that meet 
some predetermined search criteria. The data is summarized nicely and sent to New Relic and Anodot, where we can build dashboards
and anomaly detection.

Main KPIs: 

1. Total Error Count: Number of events that occurred in the last five minutes that meet the criteria
1. Trending Errors: List of Sentry issues (groups of events that Sentry considers to be the same problem) that occurred in the last five minutes
along with a link to Sentry, a description, and the number of actual events that occurred in the last five minutes.  

## Setup

To run locally: clone, `npm install`, and set the auth token in the config file. To generate an auth token for your account, visit [https://sentry.io/api/](https://sentry.io/api/). 

## TODO
 
1. Find a good scheduling service to make the task run (cronulla is a wix service, and a node server can be set up, but I'd prefer something simpler)
1. Clean up, separate config from logic, figure out a proper authentication token mechanism for all three services
1. Support multiple simultaneous filters so more than just CRM can use it
1. Pull the logic/service part out of it and open source, keep the config private