// const publicApi = require('./public');
const managementApi = require('./mgmt');
const embryologyApi = require('./embryology');
const adminApi = require('./admin');

function api(server) {
  //   server.use('/api/v1/public', publicApi);
  server.use('/api/v1/admin', adminApi);
  server.use('/api/v1/embryology', embryologyApi);
  server.use('/api/v1/mgmt', managementApi);
}

module.exports = api;
