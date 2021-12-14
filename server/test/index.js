import React from 'react';
import ReactDOM from 'react-dom';
import 'react-virtualized/styles.css'; // only needs to be imported once
import Demo from './Demo';

const { iovStats, startDates } = require('../utils/mssql_cmd');
const { getRawTuples, statApp, organizeArrayForDisplay } = require('../utils/mssql_query');

async function getList() {
  const rawTuples = await getRawTuples(iovStats('2019-07-01', '2021-07-01'));
  const rawStartDateTuples = await getRawTuples(startDates('2019-07-01', '2021-07-01'));
  const stats = await statApp(rawTuples, rawStartDateTuples);
  const array = await organizeArrayForDisplay(stats);
  return array;
}

const list = getList();

console.log(Object.keys(list[0]));

ReactDOM.render(<Demo list={list} />, document.getElementById('root'));
