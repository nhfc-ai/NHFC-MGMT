const express = require('express');
// const cors = require('cors');
const { QueryTypes } = require('sequelize');
const mssql = require('../models/Mssql');

const { newMysqlIVFInstance, formatDateWithIncrDays } = require('../utils/utils');
const { rawDPS, checklistER } = require('../utils/mssql_cmd');
const { preTriggerInfo } = require('../utils/mysql_cmd');
const { packTriggerData } = require('../utils/mysql_query');
const { packDPSData, packCheckList, getERChart } = require('../utils/mssql_query');

require('dotenv').config();

const getRootUrl = require('../../lib/api/getRootUrl');

const ROOT_URL = getRootUrl();

const router = express.Router();

router.use((req, res, next) => {
  // console.log([req.user, !req.user.isManagement]);
  if (!req.user || !req.user.isEmbryology) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

router.get('/get-dps', async (req, res) => {
  //   console.log('haha');
  try {
    const sequelize = newMysqlIVFInstance();

    const { queryDate } = req.query;
    // console.log(queryDate);
    const startDate = formatDateWithIncrDays(queryDate, -5);
    const endDate = formatDateWithIncrDays(queryDate, 0);
    // console.log([startDate, endDate]);
    const cmdDPSTuple = rawDPS(queryDate);
    const cmdTriggerTuple = preTriggerInfo(startDate, endDate);
    const rawTriggerTuples = await sequelize.query(cmdTriggerTuple, { type: QueryTypes.SELECT });
    // console.log(rawTriggerTuples);
    const pool = await mssql;
    const rawDPSTuples = await pool.request().query(cmdDPSTuple);
    // console.log(rawDPSTuples);
    const trigRecordsObj = await packTriggerData(rawTriggerTuples);
    // console.log(trigRecordsObj);
    const erChartList = await getERChart(rawDPSTuples);
    // console.log(erChartList);
    const cmdChecklist = await checklistER(erChartList);
    // console.log(cmdChecklist);
    const rawChecklistTuples = await pool.request().query(cmdChecklist);
    // console.log(rawChecklistTuples);
    const ChecklistObj = await packCheckList(rawChecklistTuples);
    // console.log(ChecklistObj);
    const finalDPSArray = await packDPSData(rawDPSTuples, trigRecordsObj, ChecklistObj);
    // console.log(finalDPSArray);
    res.json(finalDPSArray);
  } catch (err) {
    console.log(err);
    res.json({ error: err.message || err.toString() });
  }
});

module.exports = router;
