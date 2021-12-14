// NOTE: please do not put here any functions called by front-end apps.

const dfd = require('danfojs-node');
const { Sequelize } = require('sequelize');

require('dotenv').config();

const MONTH_NAME = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const monthNameIndex = new Map([
  ['Jan', 1],
  ['Feb', 2],
  ['Mar', 3],
  ['Apr', 4],
  ['May', 5],
  ['Jun', 6],
  ['Jul', 7],
  ['Aug', 8],
  ['Sep', 9],
  ['Oct', 10],
  ['Nov', 11],
  ['Dec', 12],
]);

function newMysqlInstance() {
  return new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_SERVER,
      dialect: 'mysql',
    },
  );
}

function processDate(dateArray) {
  const values = dateArray.map((dateString) => new Date(`${dateString}`));
  return values;
}

function utcMonth(dateArray) {
  return new dfd.Series(dateArray.map((date) => date.getUTCMonth()));
}

function utcMonthName(dateArray) {
  return new dfd.Series(dateArray.map((date) => MONTH_NAME[date.getUTCMonth()]));
}

function utcYear(dateArray) {
  return new dfd.Series(dateArray.map((date) => date.getUTCFullYear()));
}

function sortWithIndices(toSort) {
  for (let i = 0; i < toSort.length; i += 1) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort((left, right) => {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (let j = 0; j < toSort.length; j += 1) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}

function reorderCalendarMonths(myArray) {
  const integerArray = [];
  myArray.forEach((dateStr) => {
    const monthNum = monthNameIndex.get(dateStr.slice(0, 3));
    const yearNum = parseInt(dateStr.slice(3)) * 100;
    integerArray.push(yearNum + monthNum);
  });
  sortWithIndices(integerArray);
  return integerArray.sortIndices;
}

function convertIntegerToCapLetter(myInt) {
  const remainder = myInt % 26;
  const quotient = myInt / 26 >> 0; //eslint-disable-line
  if (quotient === 0) {
    return (remainder + 9).toString(36).toUpperCase();
  }
  if (remainder === 0) {
    return (quotient + 9).toString(36).toUpperCase() + (26 + 9).toString(36).toUpperCase();
  }
  return (quotient + 9).toString(36).toUpperCase() + (remainder + 9).toString(36).toUpperCase();
}

async function filterDataByColumn(twoDArray, myCol, mode, threshold) {
  try {
    // const tensor_arr = tf.tensor2d(twoDArray.slice(1));
    // const df = new dfd.DataFrame(tensor_arr, { columns: twoDArray[0] });
    // console.log(twoDArray.slice(1));
    // console.log(twoDArray[0]);
    const df = new dfd.DataFrame(twoDArray.slice(1), { columns: twoDArray[0] });

    let dummy;
    if (typeof threshold === 'string') {
      dummy = 'N';
    } else {
      dummy = 0;
    }
    df.fillna([dummy], { columns: [myCol], inplace: true });
    // df.print();
    if (typeof threshold === 'number' && mode === 'gt') {
      return df.loc({ rows: df.column(myCol).gt(threshold) });
    }

    if (typeof threshold === 'number' && mode === 'le') {
      return df.loc({ rows: df.column(myCol).le(threshold) });
    }

    if (typeof threshold === 'string' && mode === 'full') {
      return df.loc({ rows: df.column(myCol).eq(threshold) });
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function statDataByTime(df, myCol, interval) {
  // console.log(myCol);
  // df.sort_values({ by: myCol, inplace: true });
  // console.log(df[myCol].values);
  const dt = processDate(df[myCol].values);
  // dt.month_name().print();
  // df.addColumn({ column: 'year', values: dt.year().astype('string').values, inplace: true });
  // df.addColumn({ column: 'month', values: dt.month_name().values, inplace: true });
  df.addColumn({ column: 'year', values: utcYear(dt).astype('string').values, inplace: true });
  df.addColumn({ column: 'month', values: utcMonthName(dt).values, inplace: true });
  // df.sort_values({ by: myCol, inplace: true });
  // df.print();
  if (interval === 'monthly') {
    return df.groupby(['year', 'month']).col([myCol]).count();
  }
  return df.groupby(['year']).col([myCol]).count();
}

async function organizeIovR1DataForChart(twodArray, interval) {
  const iovDf = await filterDataByColumn(twodArray, 'Latest_IOV_Appt_Status', 'full', 'Completed');
  const iovCountDf = await statDataByTime(iovDf, 'Latest_IOV_Appt_Date', 'monthly');
  iovCountDf.rename({ mapper: { Latest_IOV_Appt_Date_count: 'IOV_count' }, inplace: true });

  const ivfR1Df = await filterDataByColumn(twodArray, 'IVF_R1', 'full', 'Y');
  const ivfR1CountDf = await statDataByTime(ivfR1Df, 'IVF_Start_Date', 'monthly');
  ivfR1CountDf.rename({ mapper: { IVF_Start_Date_count: 'IVF_R1_count' }, inplace: true });

  const innerJoinDf = dfd.merge({
    left: iovCountDf,
    right: ivfR1CountDf,
    on: ['year', 'month'],
    how: 'inner',
  });
  // innerJoinDf.print();
  innerJoinDf.addColumn({
    column: 'month+year',
    values: innerJoinDf.month.str.concat(innerJoinDf.year.astype('string').values, 1).values,
    inplace: true,
  });
  // innerJoinDf.print();
  const returnArray = innerJoinDf.loc({
    columns: ['month+year', 'IOV_count', 'IVF_R1_count'],
  }).values;

  const indexArray = reorderCalendarMonths(innerJoinDf['month+year'].values);
  // console.log(indexArray);

  const sortedReturnArray = indexArray.map((i) => returnArray[i]);
  sortedReturnArray.unshift(['month+year', 'IOV_count', 'IVF_R1_count']);
  return sortedReturnArray;
}

module.exports = { convertIntegerToCapLetter, organizeIovR1DataForChart, newMysqlInstance };
