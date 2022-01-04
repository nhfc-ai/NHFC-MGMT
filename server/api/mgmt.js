const express = require('express');
// const cors = require('cors');
const mssql = require('../models/Mssql');

const { iovStats, startDates } = require('../utils/mssql_cmd');
const {
  statApp,
  statAppForCalendly,
  organizeArrayForDisplayV2,
  organizeArrayForCalendly,
} = require('../utils/mssql_query');
const { getEventInvitees } = require('../utils/calendly_api');
const {
  formatDate,
  getUTCTimeRangeByCalenderMonth,
  getLocalTimeRangeByCalenderMonth,
} = require('../utils/utils');

const getRootUrl = require('../../lib/api/getRootUrl');

const ROOT_URL = getRootUrl();

const router = express.Router();

router.use((req, res, next) => {
  // console.log([req.user, !req.user.isManagement]);
  if (!req.user || !req.user.isManagement) {
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

router.get('/get-monthly-calendly-stats-spreadsheet', async (req, res) => {
  try {
    const { date } = req.query;
    // console.log(req.query);
    // console.log(`get-monthly-calendly-stats-spreadsheet ${date}`);
    const [startUTCDate, endUTCDate] = getUTCTimeRangeByCalenderMonth(new Date(date));
    const [startLocalDate, endLocalDate] = getLocalTimeRangeByCalenderMonth(new Date(date));

    // console.log([startUTCDate, endUTCDate, startLocalDate, endLocalDate]);
    const inviteeList = await getEventInvitees(startUTCDate, endUTCDate);
    // console.log(inviteeList.length);

    // console.log([startDate, endDate]);
    const cmdRawTuple = iovStats(startLocalDate, formatDate(new Date()));

    const pool = await mssql;
    const rawTuples = await pool.request().query(cmdRawTuple);
    // console.log(rawTuples);
    const stats = await statAppForCalendly(rawTuples);
    const array = await organizeArrayForCalendly(stats, inviteeList);
    // console.log(array);
    res.json(array);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
