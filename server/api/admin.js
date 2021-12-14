const express = require('express');
// const cors = require('cors');
const mssql = require('../models/Mssql');

const { iovStats, startDates } = require('../utils/mssql_cmd');
const { statApp, organizeArrayForDisplayV2 } = require('../utils/mssql_query');

const getRootUrl = require('../../lib/api/getRootUrl');

const ROOT_URL = getRootUrl();

const router = express.Router();

router.use((req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

router.get('/get-iov-r1-spreadsheet', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // console.log([startDate, endDate]);
    const cmdRawTuple = iovStats(startDate, endDate);
    const cmdStartDateTuple = startDates(startDate, endDate);
    const pool = await mssql;
    const rawTuples = await pool.request().query(cmdRawTuple);
    // console.log(rawTuples);
    const rawStartDateTuples = await pool.request().query(cmdStartDateTuple);
    const stats = await statApp(rawTuples, rawStartDateTuples);
    const array = await organizeArrayForDisplayV2(stats);
    // console.log(array);
    res.json(array);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
