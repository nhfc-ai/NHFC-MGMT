// const DPS_BASIC_PATH = '/media/auto_morning_report/';
const DPS_BASIC_PATH = '/Users/eva/Downloads/';

const ER_PATTERN = 'ER';
const THAW_EGG_PATTERN = ['THAWDONOR', 'THAWEGGS'];

const DPS_TABLE_HIDDEN_COLUMN = ['id', 'checked', 'scr', 'trigm'];
const DPS_INTERNAL_TABLE_HIDDEN_COLUMN = ['id', 'checked', 'icsi', 'hatching', 'md'];
const DPS_INTERNAL_TABLE_ROW_NUM = 20;

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

const PULL_DOWN_LIST = ['THAWDONOR', 'THAWEGGS', 'THAWEMB'];

const CHECKED_ALERT = 'Only CHECKED rows will be pulled out. Click Yes to continue.';
const EMPTY_ALERT =
  'NO CHECKED row. Only the raw schedule table for the lab will be pulled out. Click Yes to continue.';
const OVERWRITE_ALERT = ' DPS report has existed. Continuing it will overwrite the existing one.';

const DPS_REPORT_PREFIX = 'DPS';

const DPS_ROW_COLOR = {
  // FOR MAKA: base COLOR
  ERMAKA: 'burlywood',
  ERHYSMAKA: 'rosybrown',
  ETMAKA: 'darkolivegreen',
  FETMAKA: 'darkcyan',
  PRPMAKA: 'tan',
  HYSTOMAKA: 'rosefog',

  // FOR IV PROCEDURES
  ERIVMAKA: 'yellow',
  PRPIVMAKA: 'yellow',
  ERIV: 'yellow',
  ERPRPIV: 'yellow',
  FETIV: 'yellow',
  PRPIV: 'yellow',
  HYSTODC: 'yellow',
  UTPRP: 'yellow',
  'D & C': 'yellow',
  'ER-POSIV': 'yellow',

  ER: 'lightyellow',
  'ER-POS': 'lightyellow',
  ERPRP: 'lightyellow',

  ERHYSTO: 'red',

  FET: 'lightblue',
  FOT: 'lightblue',

  ET: 'green',
  'ET&FET': 'green',

  PRP: 'lightpink',
  PRPLOCAL: 'lightpink',
  HYSTOPRP: 'lightpink',
  TESAHYSTODC: 'lightpink',
  THAWDONOR: 'orange',
  THAWEGGS: 'orange',
  THAWEMB: 'orange',

  OVAREJ: 'lightgreen',
};

const gvMaps = {
  Discard: '1',
  Donate: '2',
  Freeze: '3',
  Missing: '9',
};

const icsiMaps = {
  YES: '1',
  NO: '2',
  'N/A': '5',
  MISSING: '9',
};

const hatchingMaps = {
  YES: '1',
  NO: '2',
  'N/A': '5',
  MISSING: '9',
};

const getConfirmCode = (consentCode) => {
  if (consentCode.slice(1, 3) === '55') {
    return 'N/A OF';
  }
  if (consentCode.slice(0, 1) === '9') {
    return 'MISSING';
  }
  if (
    consentCode.slice(0, 1) !== '9' &&
    consentCode.slice(1, 2) !== '5' &&
    consentCode.slice(2, 3) !== '5'
  ) {
    return 'YES';
  }
  return '';
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
    return '';
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
    field: 'scr',
    headerName: 'SCR',
    type: 'string',
    width: 100,
    editable: true,
    hide: true,
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
    field: 'trigm',
    headerName: 'TrigMeH',
    type: 'string',
    width: 100,
    editable: true,
    hide: true,
  },
  {
    field: 'gvConsent',
    headerName: 'GV Consent',
    type: 'singleSelect',
    valueOptions: ['', 'Discard', 'Donate', 'Freeze', 'Missing'],
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
    valueOptions: ['', 'YES', 'NO', 'N/A', 'MISSING'],
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
    valueOptions: ['', 'YES', 'NO', 'N/A', 'MISSING'],
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

const createNoteTableHeader = () => {
  return [
    [
      { content: 'No.', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      {
        content: 'Patient Name (Last, First)',
        colSpan: 1,
        rowSpan: 2,
        styles: { halign: 'center', cellWidth: 100 },
      },
      { content: 'Location', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: '#Oocyte', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: 'Fertilization Method', colSpan: 3, rowSpan: 1, styles: { halign: 'center' } },
      { content: 'Oocytes Cut', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: 'Enzyme Added to FM', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: 'Oocytes Stripped', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: 'Sperm Processed', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: 'Finish', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      { content: 'Superbill Received', colSpan: 1, rowSpan: 2, styles: { halign: 'center' } },
      {
        content: `Consent Note
GV ICSI AH
GV=1,2,3 for disc, don, spec
1=Yes, 2=No, 5=N/A, 9=Missing`,
        colSpan: 1,
        rowSpan: 2,
        styles: { halign: 'center', fontsize: 6 },
      },
    ],
    ['ICSI/CIVF', 'Reason', 'Confirm'],
  ];

  //   return [
  //     {
  //       no: 'No.',
  //       fullName: 'Patient Name',
  //       location: 'Location',
  //       oocyte: '#Oocyte',
  //       fertilizationMethod: { content: 'Fertilization Method', colSpan: 3 },
  //       oocytesCut: 'Oocytes Cut',
  //       spermProcessed: 'Sperm Processed',
  //       finish: 'Finish',
  //       superbillReceived: 'Superbill Received',
  //       consentNote: `         Consent Note
  //           GV ICSI AH
  // GV=1,2,3 for disc, don, spec
  // 1=Yes, 2=No, 5=N/A, 9=Unknown`,
  //     },
  //     {
  //       fertilizationMethod: ['ICSI/CIVF', 'Reason', 'Confirm'],
  //     },
  //   ];
};

const packNoteTableHeader = () => {
  return [
    { header: 'No.', dataKey: 'no' },
    { header: 'Patient Name (Last, First)', dataKey: 'fullName' },
    { header: 'Location', dataKey: 'location' },
    { header: '#Oocyte', dataKey: 'oocyte' },
    { header: 'Fertilization Method', dataKey: 'fertilizationMethod' },
    { header: 'Oocytes Cut', dataKey: 'oocytesCut' },
    { header: 'Enzyme Added to FM', dataKey: 'enzymeAddedtoFM' },
    { header: 'Sperm Processed', dataKey: 'spermProcessed' },
    { header: 'Oocytes Stripped', dataKey: 'oocytesStripped' },
    { header: 'Finish', dataKey: 'finish' },
    { header: 'Superbill Received', dataKey: 'superbillReceived' },
    {
      header: `Consent Note
      GV ICSI AH
      GV=1,2,3 for disc, don, spec
      1=Yes, 2=No, 5=N/A, 9=Missing`,
      dataKey: 'note',
    },
  ];
};

const FETCH_TABLE_HEADER = (column_meta, excluded_list) => {
  const header = {};
  column_meta.forEach((ele) => {
    if (excluded_list.indexOf(ele.field) === -1) {
      header[ele.field] = ele.headerName;
    }
  });
  return header;
};

function packHeader(column_meta, excluded_list) {
  const lColumns = [];
  const header = FETCH_TABLE_HEADER(column_meta, excluded_list);
  Object.keys(header).forEach((ele) => {
    lColumns.push({
      header: header[ele],
      dataKey: ele,
    });
  });
  return lColumns;
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
  FETCH_TABLE_HEADER,
  packHeader,
  createNoteTableHeader,
  DPS_TABLE_HIDDEN_COLUMN,
  DPS_INTERNAL_TABLE_HIDDEN_COLUMN,
  DPS_ROW_COLOR,
  CHECKED_ALERT,
  EMPTY_ALERT,
  OVERWRITE_ALERT,
  DPS_REPORT_PREFIX,
  DPS_BASIC_PATH,
  EXCLUDED_LABEL,
  gvMaps,
  icsiMaps,
  hatchingMaps,
  getConfirmCode,
  packNoteTableHeader,
  DPS_INTERNAL_TABLE_ROW_NUM,
  THAW_EGG_PATTERN,
  PULL_DOWN_LIST,
};
