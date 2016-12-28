/* global jasmine, process */
const Jasmine2Reporter = require('jasmine2-reporter').Jasmine2Reporter;
const TeamCityReporter = require('jasmine-reporters').TeamCityReporter;

if (process.env.IS_BUILD_AGENT) {
  jasmine.getEnv().addReporter(new TeamCityReporter());
}

const options = {
  passedSpec: false,
  stacktrace: false,
  failuresSummary: false
};

jasmine.getEnv().addReporter(new Jasmine2Reporter(options));
