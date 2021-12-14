const { iovStats, startDates } = require('../utils/mssql_cmd');
const { getRawTuples, statApp, organizeArrayForDisplayV2 } = require('../utils/mssql_query');

async function test() {
  const rawTuples = await getRawTuples(iovStats('2019-07-01', '2021-07-01'));
  const rawStartDateTuples = await getRawTuples(startDates('2019-07-01', '2021-07-01'));
  //   console.log(rawTuples.recordset.length);
  //   console.log(rawStartDateTuples.recordset);
  const stats = await statApp(rawTuples, rawStartDateTuples);
  //   console.log(Object.keys(stats));
  const array = await organizeArrayForDisplayV2(stats);
  console.log(array);
}

test();
