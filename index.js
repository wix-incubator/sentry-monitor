const run = require('./src/monitor');

module.exports = ({config, debug}) => run({debug, config});
