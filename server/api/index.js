// const publicApi = require('./public');
const managementApi = require('./mgmt');
const adminApi = require('./admin');

function api(server) {
  //   server.use('/api/v1/public', publicApi);
  server.use('/api/v1/mgmt', managementApi);
  server.use('/api/v1/admin', adminApi);
}

module.exports = api;
