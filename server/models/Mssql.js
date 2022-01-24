const sql = require('mssql');

const sqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  server: process.env.MSSQL_SERVER,
  arrayRowMode: true,
  connectionTimeout: 150000,
  requestTimeout: 150000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
};

// async function Mssql() {
//   try {
//     const pool = await sql.connect(sqlConfig);
//     console.log('Mssql database connected.');
//     return pool;
//   } catch (err) {
//     console.error('Unable to connect to the database:', err);
//   }
// }

// const pool = sql.connect(sqlConfig);

const mssql = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then((pool) => {
    console.log('Connected to mssql.');
    return pool;
  })
  .catch((err) => console.log('Database Connection Failed! Bad Config: ', err));

module.exports = mssql;
