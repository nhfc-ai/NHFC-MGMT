// const DPS_BASIC_PATH = '/media/auto_morning_report/';
const DPS_BASIC_PATH = '/Users/eva/Downloads/';

const ER_PATTERN = 'ER';

const DPS_TABLE_HIDDEN_COLUMN = ['id', 'checked'];
const EXCLUDED_LABEL = [
  'HYSTODC',
  'HYSTOMAKA',
  'HYSTOPRP',
  'PRP',
  'PRPLOCAL',
  'PRPMAKA',
  'UTPRP',
  'TESAHYSTODC',
  'PRPIV',
  'PRPIVMAKA',
  'OVAREJ',
  'D & C',
];

const CHECKED_ALERT = 'Only CHECKED rows will be pulled out. Click Yes to continue.';
const OVERWRITE_ALERT = ' DPS report has existed. Continuing it will overwrite the existing one.';

const DPS_REPORT_PREFIX = 'DPS';

const DPS_ROW_COLOR = {
  ER: 'lightyellow',
  'ER-POS': 'lightyellow',
  ERMAKA: 'lightyellow',
  ERPRP: 'lightyellow',

  ERHYSTO: 'red',
  ERHYSMAKA: 'red',

  ERIV: 'yellow',
  ERIVMAKA: 'yellow',

  FET: 'lightblue',
  FETMAKA: 'lightblue',
  FOT: 'lightblue',

  ET: 'green',
  'ET&FET': 'green',
  ETMAKA: 'green',

  FETIV: 'blue',

  PRP: 'lightpink',
  PRPLOCAL: 'lightpink',
  PRPMAKA: 'lightpink',
  UTPRP: 'lightpink',
  HYSTOMAKA: 'lightpink',
  HYSTOPRP: 'lightpink',
  HYSTODC: 'lightpink',
  TESAHYSTODC: 'lightpink',

  PRPIV: 'deeppink',
  PRPIVMAKA: 'deeppink',

  THAWDONOR: 'orange',
  THAWEGGS: 'orange',
  THAWEMB: 'orange',

  OVAREJ: 'lightgreen',
  'D & C': 'lightgreen',
};

const checkTimeFormat = (string) => {
  const stringTrimmed = string.trim();
  if (stringTrimmed.indexOf(':') === -1) {
    return false;
  }
  const strArray = stringTrimmed.split(':');
  if (strArray.length !== 2 || strArray[1].length !== 2) {
    return false;
  }

  if (parseInt(strArray[0], 10) > 23 || parseInt(strArray[0], 10) < 0) {
    return false;
  }

  if (parseInt(strArray[1], 10) > 59 || parseInt(strArray[1], 10) < 0) {
    return false;
  }
  return true;
};

const parseStandardTime = (value) => {
  if (!checkTimeFormat(value)) {
    return value;
  }
  let [h, m] = value.trim().split(':');
  h = h.length === 1 ? `0${h}` : h;
  // m = m.length === 1 ? `0${m}` : m;
  return `${h}:${m}`;
};

const DPS_TABLE_COLUMN_META = [
  { field: 'no', headerName: 'No.', width: 5, editable: true, type: 'number' },
  {
    field: 'checked',
    headerName: 'Checked',
    type: 'boolean',
    width: 80,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last Name',
    type: 'string',
    width: 100,
    editable: true,
  },
  {
    field: 'firstName',
    headerName: 'First Name',
    type: 'string',
    width: 100,
    editable: true,
  },
  {
    field: 'dob',
    headerName: 'DOB (YYYY-MM-DD)',
    type: 'date',
    width: 120,
    editable: true,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 50,
    editable: true,
  },
  {
    field: 'reason',
    headerName: 'Reason',
    type: 'string',
    width: 100,
    editable: true,
  },
  {
    field: 'time',
    headerName: 'Time (hh:mm)',
    type: 'time',
    width: 80,
    editable: true,
  },
  {
    field: 'chart',
    headerName: 'Chart',
    type: 'string',
    width: 80,
    editable: true,
  },
  {
    field: 'md',
    headerName: 'MD',
    type: 'string',
    width: 50,
    editable: true,
  },
  {
    field: 'foll',
    headerName: 'Fol/L',
    type: 'number',
    width: 60,
    editable: true,
    preProcessEditCellProps: (params) => {
      const ischeckedProps = params.otherFieldsProps.checked;
      const reasonProps = params.otherFieldsProps.reason;
      const hasError =
        reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === false &&
        ischeckedProps.value &&
        params.props.value;
      return { ...params.props, error: hasError };
    },
  },
  {
    field: 'folr',
    headerName: 'Fol/R',
    type: 'number',
    width: 60,
    editable: true,
    preProcessEditCellProps: (params) => {
      const ischeckedProps = params.otherFieldsProps.checked;
      const reasonProps = params.otherFieldsProps.reason;
      const hasError =
        reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === false &&
        ischeckedProps.value &&
        params.props.value;
      return { ...params.props, error: hasError };
    },
  },
  {
    field: 'trigt',
    headerName: 'TrigT (hh:mm)',
    type: 'string',
    width: 100,
    editable: true,
    valueParser: parseStandardTime,
  },
  {
    field: 'gvConsent',
    headerName: 'GV Consent',
    type: 'singleSelect',
    valueOptions: ['', 'Discard', 'Donate', 'Freeze', 'Unknown'],
    width: 80,
    editable: true,
    preProcessEditCellProps: (params) => {
      const ischeckedProps = params.otherFieldsProps.checked;
      const reasonProps = params.otherFieldsProps.reason;
      const hasError =
        (reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === true &&
          ischeckedProps.value &&
          !params.props.value) ||
        (reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === false &&
          ischeckedProps.value &&
          params.props.value);
      return { ...params.props, error: hasError };
    },
  },
  {
    field: 'icsi',
    headerName: 'ICSI',
    type: 'singleSelect',
    valueOptions: ['', 'YES', 'NO', 'UNKNOWN'],
    width: 80,
    editable: true,
    preProcessEditCellProps: (params) => {
      const ischeckedProps = params.otherFieldsProps.checked;
      const reasonProps = params.otherFieldsProps.reason;
      const hasError =
        (reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === true &&
          ischeckedProps.value &&
          !params.props.value) ||
        (reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === false &&
          ischeckedProps.value &&
          params.props.value);
      return { ...params.props, error: hasError };
    },
  },
  {
    field: 'hatching',
    headerName: 'Hatching',
    type: 'singleSelect',
    valueOptions: ['', 'YES', 'NO', 'UNKNOWN'],
    width: 80,
    editable: true,
    preProcessEditCellProps: (params) => {
      const ischeckedProps = params.otherFieldsProps.checked;
      const reasonProps = params.otherFieldsProps.reason;
      const hasError =
        (reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === true &&
          ischeckedProps.value &&
          !params.props.value) ||
        (reasonProps.value.toUpperCase().startsWith(ER_PATTERN) === false &&
          ischeckedProps.value &&
          params.props.value);
      return { ...params.props, error: hasError };
    },
  },
  {
    field: 'plan',
    headerName: 'PLAN',
    type: 'string',
    width: 360,
    editable: true,
    preProcessEditCellProps: (params) => {
      const ischeckedProps = params.otherFieldsProps.checked;
      const hasError = ischeckedProps.value && !params.props.value.trim();
      return { ...params.props, error: hasError };
    },
  },
];

const DPS_TABLE_HEADER = () => {
  const header = {};
  DPS_TABLE_COLUMN_META.forEach((ele) => {
    if (DPS_TABLE_HIDDEN_COLUMN.indexOf(ele.field) === -1) {
      header[ele.field] = ele.headerName;
    }
  });
  return header;
};

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

function getDateGivenIncreMonths(dateObj, increMonth) {
  const fullYear = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDay();
  const newDate = new Date(fullYear, month + increMonth, day, 0, 0, 0);
  // const newDateString = formatDate(newDate);
  return newDate;
}

function formatDateWithIncrDays(date, incr) {
  try {
    let dateObj;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    dateObj.setDate(dateObj.getDate() + incr);

    let month = `${dateObj.getMonth() + 1}`;
    let day = `${dateObj.getDate()}`;
    const year = dateObj.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
  } catch (err) {
    return null;
  }
}

module.exports = {
  formatDate,
  getDateGivenIncreMonths,
  formatDateWithIncrDays,
  ER_PATTERN,
  DPS_TABLE_COLUMN_META,
  DPS_TABLE_HEADER,
  DPS_ROW_COLOR,
  CHECKED_ALERT,
  OVERWRITE_ALERT,
  DPS_REPORT_PREFIX,
  DPS_BASIC_PATH,
  EXCLUDED_LABEL,
};
