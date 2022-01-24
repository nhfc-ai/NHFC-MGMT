const express = require('express');
// const cors = require('cors');
const mssql = require('../models/Mssql');

const { iovStats, startDates } = require('../utils/mssql_cmd');
const {
  statApp,
  statAppV2,
  statAppForCalendly,
  organizeArrayForDisplayV2,
  organizeArrayForDisplayV3,
  organizeArrayForCalendly,
} = require('../utils/mssql_query');
const { getEventInvitees } = require('../utils/calendly_api');
const {
  formatDate,
  getTodayInNextYear,
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
    const { startDate, endDate, checkedMonitor, checkedER, checkedTransfer } = req.query;
    // console.log([startDate, endDate]);
    const cmdRawTuple = iovStats(startDate, endDate);
    const cmdStartDateTuple = startDates(startDate, endDate);
    const pool = await mssql;
    const rawTuples = await pool.request().query(cmdRawTuple);
    // console.log(rawTuples);
    const rawStartDateTuples = await pool.request().query(cmdStartDateTuple);
    const stats = await statAppV2(rawTuples, rawStartDateTuples);
    // console.log(stats);
    const array = await organizeArrayForDisplayV3(
      stats,
      checkedMonitor,
      checkedER,
      checkedTransfer,
    );
    // console.log(array);
    res.json(array);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/get-monthly-calendly-stats-spreadsheet', async (req, res) => {
  try {
    const { date, checked } = req.query;
    // console.log(req.query);
    // console.log(`get-monthly-calendly-stats-spreadsheet ${date}`);
    const [startUTCDate, endUTCDate] = getUTCTimeRangeByCalenderMonth(new Date(date));
    const [startLocalDate, endLocalDate] =
      checked === 'true'
        ? getLocalTimeRangeByCalenderMonth(new Date('2021-12-03'))
        : getLocalTimeRangeByCalenderMonth(new Date(date));
    const nextYearDate = getTodayInNextYear(new Date(date));

    // console.log([startUTCDate, endUTCDate, startLocalDate, endLocalDate]);
    const inviteeList = await getEventInvitees(startUTCDate, endUTCDate, checked);
    // console.log(inviteeList);

    // console.log([startDate, endDate]);

    const cmdRawTuple = iovStats(startLocalDate, nextYearDate);

    const pool = await mssql;
    const rawTuples = await pool.request().query(cmdRawTuple);
    // console.log(rawTuples);
    const stats = await statAppForCalendly(rawTuples);
    // console.log(stats);
    const array = await organizeArrayForCalendly(stats, inviteeList);
    // console.log(array);
    res.json(array);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
