const sentryMonitor = require('../index');

describe('Sentry Monitor', () => {

  it('should expose an express app', () => {
    const config = {};
    const app = sentryMonitor(config);
    expect(app.listen).toBeDefined();
  });

});