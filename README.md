# sentry-monitor - WIP

## Big Idea

Every five minutes (or something like that), the job should run, check all events in the last five minutes, and filter to those that meet 
some predetermined search criteria. The data is summarized nicely and sent to New Relic and Anodot, where we can build dashboards
and anomaly detection.

## How it's done

The main artifact of this repo is a web server with a single endpoint. A cron job should `POST` to this endpoint
once every five minutes, triggering the job. This architecture allows it to be deployed on any number of servers with failover 
support and allows it to be safely restarted.

Main KPIs: 

1. Total Error Count: Number of events that occurred in the last five minutes that meet the criteria
1. Trending Errors: List of Sentry issues (groups of events that Sentry considers to be the same problem) that occurred in the last five minutes
along with a link to Sentry, a description, and the number of actual events that occurred in the last five minutes.  

## Setup

To run locally: clone, `npm install`, and set the auth tokens and such in a private config file. 
To generate an auth token for your Sentry account, visit [https://sentry.io/api/](https://sentry.io/api/). 

**Warning:** If you test it locally, you could be sending data to NR and Anodot when you don't mean to, which will mess up 
our charts. Add a query parameter `debug=true` to the your HTTP requests so that data isn't sent and instead is logged to the console.

## Current Status

It's running on a temporary server with a cron job that hits the server every five minutes. 
Speak to [Aaron Greenwald](https://github.com/aarongreenwald) for more info. 

## TODO
 
1. Migrate to a stable, reliable internal Wix server and lifecycle integration. 
Then use [cronulla](https://github.com/wix-private/cronulla) to trigger the task every five minutes.
1. Clean up, separate config from logic, figure out a proper authentication token mechanism for all three services
1. Support multiple simultaneous filters so more than just CRM can use it
1. Pull the logic/service part out of it and open source, keep the config private