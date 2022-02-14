// NOTE: please do not put here any functions called by front-end apps.

const dfd = require('danfojs-node');
const { Sequelize } = require('sequelize');
const nodemailer = require('nodemailer');

require('dotenv').config();

const APPOINTMENT_CODE_MAP = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Waiting',
  3: 'BeingSeen',
  4: 'Completed',
  5: 'Late',
  6: 'Missed',
  7: 'Canceled',
  8: 'Rescheduled',
  9: 'Recalled',
  10: 'Unknown',
};

const APPOINTMENT_CODE_MAP_REV = {
  Pending: 0,
  Confirmed: 1,
  Waiting: 2,
  BeingSeen: 3,
  Completed: 4,
  Late: 5,
  Missed: 6,
  Canceled: 7,
  Rescheduled: 8,
  Recalled: 9,
  Unknown: 10,
};

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

const iovR1MainTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'Latest_IOV_Appt_Status',
  'Latest_IOV_Appt_Date',
  'IOV Provider',
  'R1_Appt_Status',
  'R1_Appt_Date',
  'R1_Provider',
  'R1_Completion_Duration',
  'IVF_R1',
  'IVF_Start_Date',
  'Monitor',
  'First_Monitor_Appt_Date',
  'ER',
  'First_ER_Appt_Date',
  'Transfer',
  'First_Transfer_Type',
  'First_Transfer_Appt_Date',
];

const iovR1MonitorTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'IOV?',
  'IOV_Appt_Date',
  'IOV MD',
  'R1_Appt_Status',
  'R1_Appt_Date',
  'R1 Provider',
  'Monitor_Status',
  'Monitor_Date',
  'Return Visit?',
  'Days of Interval',
];

const iovR1ERTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'IOV?',
  'IOV_Appt_Date',
  'IOV MD',
  'ER_Status',
  'ER_Date',
];

const iovR1TransferTable = [
  'Chart',
  'DOB',
  'Age',
  'Race',
  'Primary_Code',
  'Address',
  'City',
  'State',
  'Ref_Source',
  'IOV?',
  'IOV_Appt_Date',
  'IOV MD',
  'Transfer_Status',
  'Transfer_Type',
  'Transfer_Date',
];

const r1CodeList = [
  'R1',
  'R1MAKA',
  'MONITOR',
  'R1OM',
  'OM',
  'SCANMAKA',
  'HSG',
  'ZEITHSG',
  'GENCOUNS',
  'ZHANGCOUR',
  'OVAREJ',
  'ENDOSMAKA',
  'SCREENFEM',
  'WATERSONO',
  'ZEITCOURT',
  'IUI',
  'HYSTODC',
  'BLOOD',
  'DONORFU',
  'INJECTION',
  'SCANZEIT',
  'MONMTZHAN',
  'MONITORBK',
  'BHCG',
  'SIS',
  'SF',
  'ER',
  'ENDO',
  'PGDSIGN',
  'SA',
  'DARCON',
  'PAPSMEAR',
  'PRP',
];

function formatPhoneNumber(phoneNumberString) {
  try {
    if (phoneNumberString.substring(0, 2) === '+1') {
      return `(${phoneNumberString.substring(3, 6)}) ${phoneNumberString.substring(
        7,
        10,
      )}-${phoneNumberString.substring(11, 15)}`;
    }
    return phoneNumberString.replace(/\s/g, '').substring(1, 11);
  } catch (err) {
    return '';
  }
}

function dateDiff(first, second) {
  return Math.abs(Math.round((second - first) / (1000 * 60 * 60 * 24)));
}

function formatDate(date) {
  try {
    let month = `${date.getMonth() + 1}`;
    let day = `${date.getDate()}`;
    const year = date.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
  } catch (err) {
    return null;
  }
}

function formatUTCDate(date) {
  try {
    let month = `${date.getUTCMonth() + 1}`;
    let day = `${date.getUTCDate()}`;
    const year = date.getUTCFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
  } catch (err) {
    return null;
  }
}

function formatUTCDatetime(date) {
  try {
    let month = `${date.getUTCMonth() + 1}`;
    let day = `${date.getUTCDate()}`;
    const year = date.getUTCFullYear();
    let hour = `${date.getUTCHours()}`;
    let min = `${date.getUTCMinutes()}`;
    let second = `${date.getUTCSeconds()}`;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    if (hour.length < 2) hour = `0${hour}`;
    if (min.length < 2) min = `0${min}`;
    if (second.length < 2) second = `0${second}`;

    return `${[year, month, day].join('-')}T${[hour, min, second].join(':')}Z`;
  } catch (err) {
    return null;
  }
}

function getUTCTimeRangeByCalenderMonth(dateObj) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const startDate = new Date(fullYear, month, 1, 0, 0, 0);
  const endDate = new Date(fullYear, month + 1, 0, 23, 59, 59);
  const startUTCDateString = formatUTCDatetime(startDate);
  const endUTCDateString = formatUTCDatetime(endDate);
  return [startUTCDateString, endUTCDateString];
}

function getLocalTimeRangeByCalenderMonth(dateObj) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const startDate = new Date(fullYear, month, 1, 0, 0, 0);
  const endDate = new Date(fullYear, month + 1, 0, 23, 59, 59);
  const startUTCDateString = formatDate(startDate);
  const endUTCDateString = formatDate(endDate);
  return [startUTCDateString, endUTCDateString];
}

function getTodayInNextYear(dateObj) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDay();
  const nextYearDate = new Date(fullYear + 1, month, day, 0, 0, 0);
  const nextYearDateString = formatDate(nextYearDate);
  return nextYearDateString;
}

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

async function pruneDataByDate(df, myCol, targetDateObj) {
  // console.log(myCol);
  // df.sort_values({ by: myCol, inplace: true });
  // console.log(df[myCol].values);
  const targetYear = targetDateObj.getUTCFullYear();
  const targetMonth = targetDateObj.getUTCMonth();
  // console.log([targetYear, targetMonth]);

  const dt = processDate(df.column(myCol).values);
  // console.log(dt);
  // dt.month_name().print();
  // df.addColumn({ column: 'year', values: dt.year().astype('string').values, inplace: true });
  // df.addColumn({ column: 'month', values: dt.month_name().values, inplace: true });
  df.addColumn({ column: 'year', values: utcYear(dt).astype('int32').values, inplace: true });
  df.addColumn({ column: 'month', values: utcMonth(dt).astype('int32').values, inplace: true });
  // df.sort_values({ by: myCol, inplace: true });
  // df.loc({
  //   rows: df.column('year').eq(targetYear).and(df.column('month').eq(targetMonth)),
  // }).print();
  // df.loc({ rows: df.column('month').eq(targetMonth) }).print();
  // df.loc({ rows: df.column('year').eq(targetYear) })
  //   .loc({ rows: df.column('month').eq(targetMonth) })
  //   .print();
  return df.loc({
    rows: df.column('year').eq(targetYear).and(df.column('month').eq(targetMonth)),
  });
}

async function organizeCalendlyFullModeData(twoDArray, dateObj) {
  let returnArray = [];
  const df = new dfd.DataFrame(twoDArray.slice(1), { columns: twoDArray[0] });
  const pruneDataFrame = await pruneDataByDate(df, 'Created Date', dateObj);
  // console.log(pruneDataFrame.values);
  if (pruneDataFrame.values.length !== 0) {
    returnArray = pruneDataFrame.loc({ columns: twoDArray[0] }).values;
    returnArray.unshift(twoDArray[0]);
  } else {
    returnArray.push(twoDArray[0]);
  }

  const bookedDateCountDf = await statDataByTime(df, 'Booked Date', 'monthly');
  bookedDateCountDf.rename({
    mapper: { 'Booked Date_count': 'Group_by_Booked_Date_count' },
    inplace: true,
  });
  const createdDateCountDf = await statDataByTime(df, 'Created Date', 'monthly');
  createdDateCountDf.rename({
    mapper: { 'Created Date_count': 'Group_by_Created_Date_count' },
    inplace: true,
  });

  const innerJoinDf = dfd.merge({
    left: bookedDateCountDf,
    right: createdDateCountDf,
    on: ['year', 'month'],
    how: 'outer',
  });

  innerJoinDf.addColumn({
    column: 'month+year',
    values: innerJoinDf.month.str.concat(innerJoinDf.year.astype('string').values, 1).values,
    inplace: true,
  });

  // innerJoinDf.print();
  const returnChartArray = innerJoinDf.loc({
    columns: ['month+year', 'Group_by_Created_Date_count', 'Group_by_Booked_Date_count'],
  }).values;

  const indexArray = reorderCalendarMonths(innerJoinDf['month+year'].values);
  // console.log(indexArray);

  const sortedReturnChartArray = indexArray.map((i) => returnChartArray[i]);
  sortedReturnChartArray.unshift([
    'month+year',
    'Group_by_Created_Date_count',
    'Group_by_Booked_Date_count',
  ]);
  return [returnArray, sortedReturnChartArray];
}

async function organizeIovR1DataForChart(twodArray, interval) {
  const iovDf = await filterDataByColumn(twodArray, 'Latest_IOV_Appt_Status', 'full', 'Completed');
  const iovCountDf = await statDataByTime(iovDf, 'Latest_IOV_Appt_Date', 'monthly');
  iovCountDf.rename({ mapper: { Latest_IOV_Appt_Date_count: 'IOV_count' }, inplace: true });

  const R1Df = await filterDataByColumn(twodArray, 'R1_Appt_Status', 'full', 'Completed');
  const R1CountDf = await statDataByTime(R1Df, 'R1_Appt_Date', 'monthly');
  R1CountDf.rename({ mapper: { R1_Appt_Date_count: 'R1_count' }, inplace: true });

  const ivfR1Df = await filterDataByColumn(twodArray, 'IVF_R1', 'full', 'Y');
  const ivfR1CountDf = await statDataByTime(ivfR1Df, 'IVF_Start_Date', 'monthly');
  ivfR1CountDf.rename({ mapper: { IVF_Start_Date_count: 'IVF_R1_count' }, inplace: true });

  const innerJoinDfA = dfd.merge({
    left: iovCountDf,
    right: R1CountDf,
    on: ['year', 'month'],
    how: 'inner',
  });

  const innerJoinDfB = dfd.merge({
    left: iovCountDf,
    right: ivfR1CountDf,
    on: ['year', 'month'],
    how: 'inner',
  });

  // innerJoinDf.print();
  innerJoinDfA.addColumn({
    column: 'month+year',
    values: innerJoinDfA.month.str.concat(innerJoinDfA.year.astype('string').values, 1).values,
    inplace: true,
  });
  innerJoinDfA.addColumn({
    column: 'IVF_R1_count',
    values: innerJoinDfB.IVF_R1_count.values,
    inplace: true,
  });
  // innerJoinDf.print();
  const returnArray = innerJoinDfA.loc({
    columns: ['month+year', 'IOV_count', 'R1_count', 'IVF_R1_count'],
  }).values;

  const indexArray = reorderCalendarMonths(innerJoinDfA['month+year'].values);
  // console.log(indexArray);

  const sortedReturnArray = indexArray.map((i) => returnArray[i]);
  sortedReturnArray.unshift(['month+year', 'IOV_count', 'R1_count', 'IVF_R1_count']);
  return sortedReturnArray;
}

async function sendEmail(senderObj, toEmailAddress, subject, content, htmlMode) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: senderObj.email,
      clientId: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      refreshToken: senderObj.googleRefreshToken,
      accessToken: senderObj.googleAccessToken,
    },
  });

  const mail = {
    from: senderObj.email,
    to: toEmailAddress,
    subject,
  };
  if (htmlMode === true) {
    mail.html = content;
  } else {
    mail.text = content;
  }

  transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.log(err);
      return null;
    }
    // see https://nodemailer.com/usage
    // console.log(`info.messageId: ${info.messageId}`);
    // console.log(`info.envelope: ${info.envelope}`);
    // console.log(`info.accepted: ${info.accepted}`);
    // console.log(`info.rejected: ${info.rejected}`);
    // console.log(`info.pending: ${info.pending}`);
    // console.log(`info.response: ${info.response}`);
    // console.log(info);

    return info;
    // transporter.close();
  });
}

function getState(zipString) {
  /* Ensure param is a string to prevent unpredictable parsing results */
  if (typeof zipString !== 'string') {
    // console.log('Must pass the zipcode as a string.');
    return null;
  }

  /* Ensure we have exactly 5 characters to parse */
  if (zipString.length !== 5) {
    // console.log('Must pass a 5-digit zipcode.');
    return null;
  }

  /* Ensure we don't parse strings starting with 0 as octal values */
  const zipcode = parseInt(zipString, 10);

  let st;
  let state;

  /* Code cases alphabetized by state */
  if (zipcode >= 35000 && zipcode <= 36999) {
    st = 'AL';
    state = 'Alabama';
  } else if (zipcode >= 99500 && zipcode <= 99999) {
    st = 'AK';
    state = 'Alaska';
  } else if (zipcode >= 85000 && zipcode <= 86999) {
    st = 'AZ';
    state = 'Arizona';
  } else if (zipcode >= 71600 && zipcode <= 72999) {
    st = 'AR';
    state = 'Arkansas';
  } else if (zipcode >= 90000 && zipcode <= 96699) {
    st = 'CA';
    state = 'California';
  } else if (zipcode >= 80000 && zipcode <= 81999) {
    st = 'CO';
    state = 'Colorado';
  } else if ((zipcode >= 6000 && zipcode <= 6389) || (zipcode >= 6391 && zipcode <= 6999)) {
    st = 'CT';
    state = 'Connecticut';
  } else if (zipcode >= 19700 && zipcode <= 19999) {
    st = 'DE';
    state = 'Delaware';
  } else if (zipcode >= 32000 && zipcode <= 34999) {
    st = 'FL';
    state = 'Florida';
  } else if ((zipcode >= 30000 && zipcode <= 31999) || (zipcode >= 39800 && zipcode <= 39999)) {
    st = 'GA';
    state = 'Georgia';
  } else if (zipcode >= 96700 && zipcode <= 96999) {
    st = 'HI';
    state = 'Hawaii';
  } else if (zipcode >= 83200 && zipcode <= 83999) {
    st = 'ID';
    state = 'Idaho';
  } else if (zipcode >= 60000 && zipcode <= 62999) {
    st = 'IL';
    state = 'Illinois';
  } else if (zipcode >= 46000 && zipcode <= 47999) {
    st = 'IN';
    state = 'Indiana';
  } else if (zipcode >= 50000 && zipcode <= 52999) {
    st = 'IA';
    state = 'Iowa';
  } else if (zipcode >= 66000 && zipcode <= 67999) {
    st = 'KS';
    state = 'Kansas';
  } else if (zipcode >= 40000 && zipcode <= 42999) {
    st = 'KY';
    state = 'Kentucky';
  } else if (zipcode >= 70000 && zipcode <= 71599) {
    st = 'LA';
    state = 'Louisiana';
  } else if (zipcode >= 3900 && zipcode <= 4999) {
    st = 'ME';
    state = 'Maine';
  } else if (zipcode >= 20600 && zipcode <= 21999) {
    st = 'MD';
    state = 'Maryland';
  } else if ((zipcode >= 1000 && zipcode <= 2799) || zipcode === 5501 || zipcode === 5544) {
    st = 'MA';
    state = 'Massachusetts';
  } else if (zipcode >= 48000 && zipcode <= 49999) {
    st = 'MI';
    state = 'Michigan';
  } else if (zipcode >= 55000 && zipcode <= 56899) {
    st = 'MN';
    state = 'Minnesota';
  } else if (zipcode >= 38600 && zipcode <= 39999) {
    st = 'MS';
    state = 'Mississippi';
  } else if (zipcode >= 63000 && zipcode <= 65999) {
    st = 'MO';
    state = 'Missouri';
  } else if (zipcode >= 59000 && zipcode <= 59999) {
    st = 'MT';
    state = 'Montana';
  } else if (zipcode >= 27000 && zipcode <= 28999) {
    st = 'NC';
    state = 'North Carolina';
  } else if (zipcode >= 58000 && zipcode <= 58999) {
    st = 'ND';
    state = 'North Dakota';
  } else if (zipcode >= 68000 && zipcode <= 69999) {
    st = 'NE';
    state = 'Nebraska';
  } else if (zipcode >= 88900 && zipcode <= 89999) {
    st = 'NV';
    state = 'Nevada';
  } else if (zipcode >= 3000 && zipcode <= 3899) {
    st = 'NH';
    state = 'New Hampshire';
  } else if (zipcode >= 7000 && zipcode <= 8999) {
    st = 'NJ';
    state = 'New Jersey';
  } else if (zipcode >= 87000 && zipcode <= 88499) {
    st = 'NM';
    state = 'New Mexico';
  } else if (
    (zipcode >= 10000 && zipcode <= 14999) ||
    zipcode === 6390 ||
    zipcode === 501 ||
    zipcode === 544
  ) {
    st = 'NY';
    state = 'New York';
  } else if (zipcode >= 43000 && zipcode <= 45999) {
    st = 'OH';
    state = 'Ohio';
  } else if ((zipcode >= 73000 && zipcode <= 73199) || (zipcode >= 73400 && zipcode <= 74999)) {
    st = 'OK';
    state = 'Oklahoma';
  } else if (zipcode >= 97000 && zipcode <= 97999) {
    st = 'OR';
    state = 'Oregon';
  } else if (zipcode >= 15000 && zipcode <= 19699) {
    st = 'PA';
    state = 'Pennsylvania';
  } else if (zipcode >= 300 && zipcode <= 999) {
    st = 'PR';
    state = 'Puerto Rico';
  } else if (zipcode >= 2800 && zipcode <= 2999) {
    st = 'RI';
    state = 'Rhode Island';
  } else if (zipcode >= 29000 && zipcode <= 29999) {
    st = 'SC';
    state = 'South Carolina';
  } else if (zipcode >= 57000 && zipcode <= 57999) {
    st = 'SD';
    state = 'South Dakota';
  } else if (zipcode >= 37000 && zipcode <= 38599) {
    st = 'TN';
    state = 'Tennessee';
  } else if (
    (zipcode >= 75000 && zipcode <= 79999) ||
    (zipcode >= 73301 && zipcode <= 73399) ||
    (zipcode >= 88500 && zipcode <= 88599)
  ) {
    st = 'TX';
    state = 'Texas';
  } else if (zipcode >= 84000 && zipcode <= 84999) {
    st = 'UT';
    state = 'Utah';
  } else if (zipcode >= 5000 && zipcode <= 5999) {
    st = 'VT';
    state = 'Vermont';
  } else if (
    (zipcode >= 20100 && zipcode <= 20199) ||
    (zipcode >= 22000 && zipcode <= 24699) ||
    zipcode === 20598
  ) {
    st = 'VA';
    state = 'Virginia';
  } else if (
    (zipcode >= 20000 && zipcode <= 20099) ||
    (zipcode >= 20200 && zipcode <= 20599) ||
    (zipcode >= 56900 && zipcode <= 56999)
  ) {
    st = 'DC';
    state = 'Washington DC';
  } else if (zipcode >= 98000 && zipcode <= 99499) {
    st = 'WA';
    state = 'Washington';
  } else if (zipcode >= 24700 && zipcode <= 26999) {
    st = 'WV';
    state = 'West Virginia';
  } else if (zipcode >= 53000 && zipcode <= 54999) {
    st = 'WI';
    state = 'Wisconsin';
  } else if (zipcode >= 82000 && zipcode <= 83199) {
    st = 'WY';
    state = 'Wyoming';
  } else {
    st = null;
    state = null;
    // console.log('No state found matching', zipcode);
  }

  return st;
}

module.exports = {
  convertIntegerToCapLetter,
  organizeIovR1DataForChart,
  newMysqlInstance,
  sendEmail,
  getUTCTimeRangeByCalenderMonth,
  getLocalTimeRangeByCalenderMonth,
  formatDate,
  formatUTCDate,
  formatPhoneNumber,
  getState,
  getTodayInNextYear,
  organizeCalendlyFullModeData,
  dateDiff,
  iovR1MainTable,
  iovR1MonitorTable,
  iovR1ERTable,
  iovR1TransferTable,
  r1CodeList,
  APPOINTMENT_CODE_MAP,
  APPOINTMENT_CODE_MAP_REV,
};
