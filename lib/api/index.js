// const publicApi = require('./public');
const customerApi = require('./mgmt');
const labApi = require('./embryology');
const adminApi = require('./admin');

function api(server) {
  //   server.use('/api/v1/public', publicApi);
  server.use('/api/v1/mgmt', customerApi);
  server.use('/api/v1/embryology', labApi);
  server.use('/api/v1/admin', adminApi);
}

module.exports = api;
