const mssql = require('../models/Mssql');
const {
  formatPhoneNumber,
  formatDate,
  formatTime,
  formatUTCDate,
  formatUTCTime,
  dateDiff,
  iovR1MainTable,
  iovR1MonitorTable,
  iovR1ERTable,
  iovR1TransferTable,
  R1FollowUpTable,
  columnTitleList,
  referringPhysicianCode,
  r1CodeList,
  APPOINTMENT_CODE_MAP,
  APPOINTMENT_CODE_MAP_REV,
  ER_PATTERN,
} = require('./utils');

function calAge(dob) {
  const now = new Date();
  try {
    return (
      now.getFullYear() -
      dob.getFullYear() -
      ([now.getMonth(), now.getDate()] < [dob.getMonth(), dob.getDate()])
    );
  } catch (err) {
    return null;
  }
}

function identApptReason(obj, pattern) {
  let flag = false;
  obj.reason.forEach((ele) => {
    if (ele.toUpperCase().startsWith(pattern) === true) {
      flag = true;
    }
  });
  return flag;
}

async function getRawTuples(cmd) {
  try {
    const pool = await mssql;
    const rawTuples = pool.request().query(cmd);
    return rawTuples;
  } catch (err) {
    console.log(err.message);
    return null;
  }
}

async function statRefSourceCodes(tuples) {
  const stat = {};
  for (let i = 0; i < tuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const { Chart_Number, ref_source_value } = tuples.recordset[i];
    stat[Chart_Number] = ref_source_value;
  }
  return stat;
}

async function statApp(tuples, startDateTuples) {
  const stat = {};
  for (let i = 0; i < tuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const {
      Chart,
      city,
      State,
      Birth_Date,
      Primary_Code,
      Address_1,
      Race,
      Ref_Source,
      Reason,
      Status,
      Appt_Date,
      MD,
      First_Name,
      Last_Name,
      Home_Email,
      Home_Phone,
    } = tuples.recordset[i];
    if (Chart in stat === false) {
      stat[Chart] = {
        city,
        state: State,
        reason: [],
        dob: Birth_Date,
        age: calAge(Birth_Date),
        code: Primary_Code,
        address: Address_1,
        race: Race,
        refSource: Ref_Source,
        iovApptDate: null,
        iovApptStatus: null,
        r1ApptDate: null,
        r1ApptStatus: null,
        md: null,
        erCounter: 0,
        monitorCounter: 0,
        ivfR1: null,
        ivfStartDate: null,
        firstName: First_Name.replace(/\s/g, '').toLowerCase() || '',
        lastName: Last_Name.replace(/\s/g, '').toLowerCase() || '',
        email: Home_Email.replace(/\s/g, '').toLowerCase() || '',
        phone: Home_Phone || '',
      };
    }

    stat[Chart].reason.push(Reason);
    if (typeof Reason === 'string') {
      if (
        Reason.toUpperCase().startsWith('IOV') === true &&
        (stat[Chart].iovApptDate <= Appt_Date || Status === APPOINTMENT_CODE_MAP_REV.Completed)
      ) {
        stat[Chart].iovApptStatus = APPOINTMENT_CODE_MAP[Status];
        stat[Chart].iovApptDate = Appt_Date;
        stat[Chart].md = MD;
      }

      if (
        Reason.toUpperCase().startsWith('R1') === true &&
        (stat[Chart].r1ApptDate <= Appt_Date || Status === APPOINTMENT_CODE_MAP_REV.Completed)
      ) {
        stat[Chart].r1ApptStatus = APPOINTMENT_CODE_MAP[Status];
        stat[Chart].r1ApptDate = Appt_Date;
      }

      if (
        Reason.toUpperCase().startsWith('ER') === true &&
        APPOINTMENT_CODE_MAP[Status] === 'Completed'
      ) {
        stat[Chart].erCounter += 1;
      }

      if (Reason.toUpperCase().startsWith('MONITOR') === true) {
        stat[Chart].monitorCounter += 1;
      }
    }
  }

  for (let i = 0; i < startDateTuples.recordset.length; i += 1) {
    const { Chart_Number, StartDate } = startDateTuples.recordset[i];
    if (Chart_Number in stat) {
      if (stat[Chart_Number].ivfStartDate < StartDate) {
        stat[Chart_Number].ivfStartDate = StartDate;
        stat[Chart_Number].ivfR1 = 'Y';
      }
    }
  }

  return stat;
}

async function statAppV2(tuples, startDateTuples) {
  const stat = {};
  for (let i = 0; i < tuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const {
      Chart,
      city,
      State,
      Birth_Date,
      Primary_Code,
      Address_1,
      Race,
      Ref_Source,
      Reason,
      Status,
      Appt_Date,
      MD,
      Provider,
      First_Name,
      Last_Name,
      Home_Email,
      Home_Phone,
    } = tuples.recordset[i];
    if (Chart in stat === false) {
      stat[Chart] = {
        city,
        state: State,
        reason: [],
        dob: Birth_Date,
        age: calAge(Birth_Date),
        code: Primary_Code,
        address: Address_1,
        race: Race,
        refSource: Ref_Source,
        iovApptDate: null,
        iovApptStatus: null,
        r1ApptDate: [],
        r1ApptStatus: [],
        r1Provider: [],
        ivfR1: '',
        ivfStartDate: null,
        md: null,
        monitorStatus: [],
        monitorDate: [],
        monitor: null,
        first_monitor_date: null,
        erStatus: [],
        erDate: [],
        er: null,
        first_er_date: null,
        transferType: [],
        transferStatus: [],
        transferDate: [],
        transfer: null,
        first_transfer_date: null,
        first_transfer_type: null,
        firstName: First_Name.replace(/\s/g, '').toLowerCase() || '',
        lastName: Last_Name.replace(/\s/g, '').toLowerCase() || '',
        email: Home_Email.replace(/\s/g, '').toLowerCase() || '',
        phone: Home_Phone || '',
      };
    }

    stat[Chart].reason.push(Reason);
    if (typeof Reason === 'string') {
      if (
        Reason.toUpperCase().startsWith('IOV') === true &&
        (stat[Chart].iovApptDate <= Appt_Date || Status === APPOINTMENT_CODE_MAP_REV.Completed)
      ) {
        stat[Chart].iovApptStatus = APPOINTMENT_CODE_MAP[Status];
        stat[Chart].iovApptDate = Appt_Date;
        stat[Chart].md = MD;
      }

      // R1 codes are messed. check r1CodeList for more info
      const r1Index = stat[Chart].r1ApptStatus.length > 0 ? stat[Chart].r1ApptStatus.length - 1 : 0;
      if (
        stat[Chart].iovApptStatus === 'Completed' &&
        stat[Chart].r1ApptStatus[r1Index] !== 'Completed'
      ) {
        if (r1CodeList.indexOf(Reason) !== -1) {
          stat[Chart].r1ApptStatus.push(APPOINTMENT_CODE_MAP[Status]);
          stat[Chart].r1ApptDate.push(Appt_Date);
          stat[Chart].r1Provider.push(Provider);
        }
      }

      if (Reason.toUpperCase().startsWith('ER') === true) {
        stat[Chart].erDate.push(Appt_Date);
        if (
          Status === APPOINTMENT_CODE_MAP_REV.Completed &&
          stat[Chart].erStatus.indexOf(APPOINTMENT_CODE_MAP[Status]) === -1
        ) {
          stat[Chart].er = 'Y';
          stat[Chart].first_er_date = Appt_Date;
        }
        stat[Chart].erStatus.push(APPOINTMENT_CODE_MAP[Status]);
      }

      if (
        Reason.toUpperCase().startsWith('MONITOR') === true ||
        Reason.toUpperCase().startsWith('BLOOD') === true ||
        Reason.toUpperCase().startsWith('SONO') === true ||
        Reason.toUpperCase().startsWith('SCAN') === true ||
        Reason.toUpperCase().startsWith('WATERSONO') === true
      ) {
        stat[Chart].monitorDate.push(Appt_Date);
        if (
          Status === APPOINTMENT_CODE_MAP_REV.Completed &&
          stat[Chart].monitorStatus.indexOf(APPOINTMENT_CODE_MAP[Status]) === -1
        ) {
          stat[Chart].monitor = 'Y';
          stat[Chart].first_monitor_date = Appt_Date;
        }
        stat[Chart].monitorStatus.push(APPOINTMENT_CODE_MAP[Status]);
      }

      if (
        Reason.toUpperCase().startsWith('ET') === true ||
        Reason.toUpperCase().startsWith('FET') === true
      ) {
        stat[Chart].transferDate.push(Appt_Date);
        stat[Chart].transferType.push(Reason.toUpperCase());
        if (
          Status === APPOINTMENT_CODE_MAP_REV.Completed &&
          stat[Chart].transferStatus.indexOf(APPOINTMENT_CODE_MAP[Status]) === -1
        ) {
          stat[Chart].transfer = 'Y';
          stat[Chart].first_transfer_date = Appt_Date;
          stat[Chart].first_transfer_type = Reason.toUpperCase();
        }
        stat[Chart].transferStatus.push(APPOINTMENT_CODE_MAP[Status]);
      }
    }
  }

  for (let i = 0; i < startDateTuples.recordset.length; i += 1) {
    const { Chart_Number, StartDate } = startDateTuples.recordset[i];
    if (Chart_Number in stat) {
      if (stat[Chart_Number].ivfStartDate < StartDate) {
        stat[Chart_Number].ivfStartDate = StartDate;
        stat[Chart_Number].ivfR1 = 'Y';
      }
    }
  }

  return stat;
}

async function statAppV3(tuples, startDateTuples, refSourceCodesTuples) {
  const stat = {};
  const refStat = await statRefSourceCodes(refSourceCodesTuples);
  for (let i = 0; i < tuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const {
      Chart,
      city,
      State,
      Birth_Date,
      Primary_Code,
      Address_1,
      Race,
      Ref_Source,
      Reason,
      Status,
      Appt_Date,
      MD,
      Provider,
      First_Name,
      Last_Name,
      Home_Email,
      Home_Phone,
    } = tuples.recordset[i];
    if (Chart in stat === false) {
      stat[Chart] = {
        city,
        state: State,
        reason: [],
        dob: Birth_Date,
        age: calAge(Birth_Date),
        code: Primary_Code,
        address: Address_1,
        race: Race,
        refSource: Ref_Source,
        refSourceCode: refStat[Chart] || '',
        refSourceMD: Chart in refStat ? referringPhysicianCode[refStat[Chart]] || '' : '',
        iovApptDate: null,
        iovApptStatus: null,
        r1ApptDate: [],
        r1ApptStatus: [],
        r1Provider: [],
        ivfR1: '',
        ivfStartDate: null,
        md: null,
        monitorType: [],
        monitorStatus: [],
        monitorDate: [],
        monitor: null,
        first_monitor_date: null,
        erStatus: [],
        erDate: [],
        er: null,
        first_er_date: null,
        transferType: [],
        transferStatus: [],
        transferDate: [],
        transfer: null,
        first_transfer_date: null,
        first_transfer_type: null,
        firstName: First_Name.replace(/\s/g, '').toLowerCase() || '',
        lastName: Last_Name.replace(/\s/g, '').toLowerCase() || '',
        email: Home_Email.replace(/\s/g, '').toLowerCase() || '',
        phone: Home_Phone || '',
      };
    }

    stat[Chart].reason.push(Reason);
    if (typeof Reason === 'string') {
      if (
        Reason.toUpperCase().startsWith('IOV') === true &&
        (stat[Chart].iovApptDate <= Appt_Date || Status === APPOINTMENT_CODE_MAP_REV.Completed)
      ) {
        stat[Chart].iovApptStatus = APPOINTMENT_CODE_MAP[Status];
        stat[Chart].iovApptDate = Appt_Date;
        stat[Chart].md = MD;
      }

      // R1 codes are messed. check r1CodeList for more info
      const r1Index = stat[Chart].r1ApptStatus.length > 0 ? stat[Chart].r1ApptStatus.length - 1 : 0;
      if (
        stat[Chart].iovApptStatus === 'Completed' &&
        stat[Chart].r1ApptStatus[r1Index] !== 'Completed'
      ) {
        if (r1CodeList.indexOf(Reason) !== -1) {
          stat[Chart].r1ApptStatus.push(APPOINTMENT_CODE_MAP[Status]);
          stat[Chart].r1ApptDate.push(Appt_Date);
          stat[Chart].r1Provider.push(Provider);
        }
      }

      if (Reason.toUpperCase().startsWith('ER') === true) {
        stat[Chart].erDate.push(Appt_Date);
        if (
          Status === APPOINTMENT_CODE_MAP_REV.Completed &&
          stat[Chart].erStatus.indexOf(APPOINTMENT_CODE_MAP[Status]) === -1
        ) {
          stat[Chart].er = 'Y';
          stat[Chart].first_er_date = Appt_Date;
        }
        stat[Chart].erStatus.push(APPOINTMENT_CODE_MAP[Status]);
      }

      if (
        Reason.toUpperCase().startsWith('MONITOR') === true ||
        Reason.toUpperCase().startsWith('BLOOD') === true ||
        Reason.toUpperCase().startsWith('SONO') === true ||
        Reason.toUpperCase().startsWith('SCAN') === true ||
        Reason.toUpperCase().startsWith('WATERSONO') === true ||
        Reason.toUpperCase().startsWith('MONMT') === true
      ) {
        stat[Chart].monitorType.push(Reason);
        stat[Chart].monitorDate.push(Appt_Date);
        if (
          Status === APPOINTMENT_CODE_MAP_REV.Completed &&
          stat[Chart].monitorStatus.indexOf(APPOINTMENT_CODE_MAP[Status]) === -1
        ) {
          stat[Chart].monitor = 'Y';
          stat[Chart].first_monitor_date = Appt_Date;
        }
        stat[Chart].monitorStatus.push(APPOINTMENT_CODE_MAP[Status]);
      }

      if (
        Reason.toUpperCase().startsWith('ET') === true ||
        Reason.toUpperCase().startsWith('FET') === true
      ) {
        stat[Chart].transferDate.push(Appt_Date);
        stat[Chart].transferType.push(Reason.toUpperCase());
        if (
          Status === APPOINTMENT_CODE_MAP_REV.Completed &&
          stat[Chart].transferStatus.indexOf(APPOINTMENT_CODE_MAP[Status]) === -1
        ) {
          stat[Chart].transfer = 'Y';
          stat[Chart].first_transfer_date = Appt_Date;
          stat[Chart].first_transfer_type = Reason.toUpperCase();
        }
        stat[Chart].transferStatus.push(APPOINTMENT_CODE_MAP[Status]);
      }
    }
  }

  for (let i = 0; i < startDateTuples.recordset.length; i += 1) {
    const { Chart_Number, StartDate } = startDateTuples.recordset[i];
    if (Chart_Number in stat) {
      if (stat[Chart_Number].ivfStartDate < StartDate) {
        stat[Chart_Number].ivfStartDate = StartDate;
        stat[Chart_Number].ivfR1 = 'Y';
      }
    }
  }

  return stat;
}
async function getERChart(dpsTuples) {
  const outArray = [];
  for (let i = 0; i < dpsTuples.recordset.length; i += 1) {
    const { ChartStr, Last_Name, First_Name, Birth_Date, Reason, Status, Appt_Time, Chart, Plan1 } =
      dpsTuples.recordset[i];
    if (Reason.startsWith(ER_PATTERN) === true) {
      outArray.push(ChartStr);
    }
  }
  return outArray;
}

async function packDPSData(dpsTuples, triggerObj, checkListObj) {
  const outArray = [];
  for (let i = 0; i < dpsTuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const { ChartStr, Last_Name, First_Name, Birth_Date, Reason, Status, Appt_Time, Chart, Plan1 } =
      dpsTuples.recordset[i];

    const Plan = Plan1 ? Plan1.replace(/\n/g, ' ').replace(/\r/g, ' ') : '';
    // if (Reason.toUpperCase().startsWith('IOV') === false) {
    //   continue;
    // }
    let checkListStr = ``;
    if (Chart in checkListObj === true) {
      if (checkListObj[Chart].missing.length > 0) {
        checkListStr += 'Missing: ';
        checkListObj[Chart].missing.forEach((ele) => {
          checkListStr += `${ele} `;
        });
      }
      if (checkListObj[Chart].pending.length > 0) {
        checkListStr += 'Pending: ';
        checkListObj[Chart].pending.forEach((ele) => {
          checkListStr += `${ele} `;
        });
      }
      if (checkListObj[Chart].pending.length === 0 && checkListObj[Chart].missing.length === 0) {
        checkListStr += 'OK';
      }
    }

    const subObj = {
      id: i + 1,
      no: i + 1,
      lastName: Last_Name.trim(),
      firstName: First_Name.trim(),
      dob: formatUTCDate(Birth_Date),
      age: calAge(Birth_Date),
      reason: Reason,
      time: formatUTCTime(Appt_Time),
      chart: Chart,
      md: '',
      foll: Chart in triggerObj && Reason.indexOf(ER_PATTERN) !== -1 ? triggerObj[Chart].l : '',
      folr: Chart in triggerObj && Reason.indexOf(ER_PATTERN) !== -1 ? triggerObj[Chart].r : '',
      trigt: Chart in triggerObj && Reason.indexOf(ER_PATTERN) !== -1 ? triggerObj[Chart].trgt : '',
      trigm: Chart in triggerObj && Reason.indexOf(ER_PATTERN) !== -1 ? triggerObj[Chart].trgm : '',
      gvConsent: '',
      icsi: '',
      hatching: '',
      plan: Plan,
      checked: false,
      scr: checkListStr,
    };
    outArray.push(subObj);
  }

  return outArray;
}

async function packCheckList(checkListTuples) {
  const checkList = {};
  const outChecklist = {};
  const today = new Date();
  for (let i = 0; i < checkListTuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const { Chart, Name, Date, Result, Type } = checkListTuples.recordset[i];

    const safeResult = Result || '';

    if (Chart in checkList === false) {
      checkList[Chart] = {};
      checkList[Chart][Name] = { date: Date, result: safeResult };
    } else if (Name in checkList[Chart] === false) {
      checkList[Chart][Name] = { date: Date, result: safeResult };
    } else if (checkList[Chart][Name].date) {
      if (Date > checkList[Chart][Name].date) {
        checkList[Chart][Name].date = Date;
      }
    } else {
      checkList[Chart][Name].date = Date;
    }
  }

  Object.keys(checkList).forEach((ele) => {
    outChecklist[parseInt(ele, 10)] = { missing: [], pending: [] };
    Object.keys(checkList[ele]).forEach((subEle) => {
      if (!checkList[ele][subEle].date) {
        outChecklist[parseInt(ele, 10)].missing.push(subEle);
      } else if (dateDiff(today, checkList[ele][subEle].date) >= 365) {
        outChecklist[parseInt(ele, 10)].missing.push(subEle);
      } else if (checkList[ele][subEle].result === '') {
        outChecklist[parseInt(ele, 10)].pending.push(subEle);
      }
    });
  });

  return outChecklist;
}

async function statAppForCalendly(tuples) {
  const stat = {};
  for (let i = 0; i < tuples.recordset.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const {
      Chart,
      city,
      State,
      Birth_Date,
      Primary_Code,
      Address_1,
      Race,
      Ref_Source,
      Reason,
      Status,
      Appt_Date,
      MD,
      First_Name,
      Last_Name,
      Home_Email,
      Home_Phone,
    } = tuples.recordset[i];

    // if (Reason.toUpperCase().startsWith('IOV') === false) {
    //   continue;
    // }

    const Email = Home_Email.split(' ')[0];
    // console.log([Email, Home_Phone]);
    const statKey = `${First_Name} ${Last_Name} ${Email.toLowerCase() || ''} ${Home_Phone}`;
    const statKeyAlt = Email ? Email.toLowerCase() : Home_Phone;

    if (statKey in stat === false) {
      stat[statKey] = {
        chart: Chart,
        insurance: Primary_Code,
        phone: Home_Phone || '',
        dob: Birth_Date,
        firstName: First_Name.replace(/\s/g, '').toLowerCase() || '',
        lastName: Last_Name.replace(/\s/g, '').toLowerCase() || '',
        state: State,
        email: Email.replace(/\s/g, '').toLowerCase() || '',
        reason: [],
        iovApptDate: null,
        iovApptStatus: null,
      };
    }
    if (statKeyAlt && statKeyAlt in stat === false) {
      stat[statKeyAlt] = {
        chart: Chart,
        insurance: Primary_Code,
        phone: Home_Phone || '',
        dob: Birth_Date,
        firstName: First_Name.replace(/\s/g, '').toLowerCase() || '',
        lastName: Last_Name.replace(/\s/g, '').toLowerCase() || '',
        state: State,
        email: Email.replace(/\s/g, '').toLowerCase() || '',
        reason: [],
        iovApptDate: null,
        iovApptStatus: null,
      };
    }

    stat[statKey].reason.push(Reason);
    if (statKeyAlt) {
      stat[statKeyAlt].reason.push(Reason);
    }

    if (typeof Reason === 'string') {
      if (
        Reason.toUpperCase().startsWith('IOV') === true &&
        (stat[statKey].iovApptDate <= Appt_Date || Status === APPOINTMENT_CODE_MAP_REV.Completed)
      ) {
        stat[statKey].iovApptStatus = APPOINTMENT_CODE_MAP[Status];
        stat[statKey].iovApptDate = Appt_Date;
        if (statKeyAlt) {
          stat[statKeyAlt].iovApptStatus = APPOINTMENT_CODE_MAP[Status];
          stat[statKeyAlt].iovApptDate = Appt_Date;
        }
      }
    }
  }

  return stat;
}

async function organizeArrayForDisplay(obj) {
  const arrayForDispaly = [];
  //   const chartList = Object.keys(obj);
  //   console.log(typeof chartList);
  //   const columnList = Object.keys(obj.chartList[0]);
  Object.keys(obj).forEach((element) => {
    // const flagIOV = obj.element.iovApptDate !== null;
    // const flagIOVCompleted = obj.element.iovApptStatus === APPOINTMENT_CODE_MAP_REV.Completed;
    // const flagR1, flagR1Completed = obj.element.r1ApptDate !== null;
    // console.log(obj[element].reason);
    // console.log(identApptReason(obj[element], 'IOV'));
    if (identApptReason(obj[element], 'IOV') === true) {
      const subObject = {
        Chart: element,
        DOB: obj[element].dob,
        Age: obj[element].age,
        Race: obj[element].race,
        Primary_Code: obj[element].code,
        Address: obj[element].address,
        City: obj[element].city,
        State: obj[element].state,
        Ref_Source: obj[element].refSource,
        Latest_IOV_Appt_Status: obj[element].iovApptStatus,
        Latest_IOV_Appt_Date: obj[element].iovApptDate,
        MD: obj[element].md,
        R1_Appt_Status: obj[element].r1ApptStatus,
        R1_Appt_Date: obj[element].r1ApptDate,
        IVF_R1: obj[element].ivfR1,
        IVF_Start_Date: obj[element].ivfStartDate,
        Monitor_Count: obj[element].monitorCounter,
        ER_Count: obj[element].erCounter,
      };
      arrayForDispaly.push(subObject);
    }
  });
  return arrayForDispaly;
}

async function organizeArrayForDisplayV2(obj) {
  const arrayForDispaly = [];
  const columnTitleList = [
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
    'MD',
    'R1_Appt_Status',
    'R1_Appt_Date',
    'IVF_R1',
    'IVF_Start_Date',
    '#Monitor',
    '#ER',
  ];
  arrayForDispaly.push(columnTitleList);
  //   const chartList = Object.keys(obj);
  //   console.log(typeof chartList);
  //   const columnList = Object.keys(obj.chartList[0]);
  Object.keys(obj).forEach((element) => {
    // const flagIOV = obj.element.iovApptDate !== null;
    // const flagIOVCompleted = obj.element.iovApptStatus === APPOINTMENT_CODE_MAP_REV.Completed;
    // const flagR1, flagR1Completed = obj.element.r1ApptDate !== null;
    // console.log(obj[element].reason);
    // console.log(identApptReason(obj[element], 'IOV'));
    if (identApptReason(obj[element], 'IOV') === true) {
      const subList = [
        element,
        formatDate(obj[element].dob),
        obj[element].age,
        obj[element].race,
        obj[element].code,
        obj[element].address,
        obj[element].city,
        obj[element].state,
        obj[element].refSource,
        obj[element].iovApptStatus,
        formatDate(obj[element].iovApptDate),
        obj[element].md,
        obj[element].r1ApptStatus,
        formatDate(obj[element].r1ApptDate),
        obj[element].ivfR1,
        formatDate(obj[element].ivfStartDate),
        obj[element].monitorCounter,
        obj[element].erCounter,
      ];
      arrayForDispaly.push(subList);
    }
  });
  return arrayForDispaly;
}

async function organizeArrayForDisplayV3(obj, checkedMonitor, checkedER, checkedTransfer) {
  const arrayForDispaly = [];
  const arrayForDispalyMonitor = [];
  const arrayForDispalyER = [];
  const arrayForDispalyTransfer = [];

  // const columnTitleList = iovR1MainTable;
  arrayForDispaly.push(iovR1MainTable);
  arrayForDispalyMonitor.push(iovR1MonitorTable);
  arrayForDispalyER.push(iovR1ERTable);
  arrayForDispalyTransfer.push(iovR1TransferTable);
  //   const chartList = Object.keys(obj);
  //   console.log(typeof chartList);
  //   const columnList = Object.keys(obj.chartList[0]);
  Object.keys(obj).forEach((element) => {
    // const flagIOV = obj.element.iovApptDate !== null;
    // const flagIOVCompleted = obj.element.iovApptStatus === APPOINTMENT_CODE_MAP_REV.Completed;
    // const flagR1, flagR1Completed = obj.element.r1ApptDate !== null;
    // console.log(obj[element].reason);
    // console.log(identApptReason(obj[element], 'IOV'));
    let r1ApptStatus = '';
    let r1ApptDate = '';
    let r1Provider = '';
    let r1CompletedInterval = '';
    if (identApptReason(obj[element], 'IOV') === true) {
      if (obj[element].r1ApptStatus.length === 1) {
        [r1ApptStatus] = obj[element].r1ApptStatus;
        [r1ApptDate] = obj[element].r1ApptDate;
        r1Provider = obj[element].r1Provider[0].replace(/^CC/gi, '').toUpperCase() || '';
        r1CompletedInterval = r1ApptStatus === 'Completed' ? 0 : '';
      }

      if (obj[element].r1ApptStatus.length > 1) {
        const r1Index = obj[element].r1ApptStatus.length - 1;
        r1ApptStatus = obj[element].r1ApptStatus[r1Index];
        r1ApptDate = obj[element].r1ApptDate[r1Index];
        r1Provider = obj[element].r1Provider[r1Index].replace(/^CC/gi, '').toUpperCase() || '';
        r1CompletedInterval =
          r1ApptStatus === 'Completed'
            ? dateDiff(obj[element].r1ApptDate[0], obj[element].r1ApptDate[r1Index])
            : '';
      }
      const subList = [
        element,
        `${obj[element].firstName[0].toUpperCase()}${obj[element].firstName.slice(1)}` || '',
        `${obj[element].lastName[0].toUpperCase()}${obj[element].lastName.slice(1)}` || '',
        formatUTCDate(obj[element].dob),
        obj[element].age,
        obj[element].race,
        obj[element].email,
        obj[element].phone,
        obj[element].code,
        obj[element].address,
        obj[element].city,
        obj[element].state,
        obj[element].refSource,
        obj[element].refSourceCode,
        obj[element].refSourceMD,
        obj[element].iovApptStatus,
        formatUTCDate(obj[element].iovApptDate),
        obj[element].md,
        r1ApptStatus,
        formatUTCDate(r1ApptDate),
        r1Provider,
        r1CompletedInterval,
        obj[element].ivfR1,
        formatUTCDate(obj[element].ivfStartDate),
        obj[element].monitor,
        formatUTCDate(obj[element].first_monitor_date),
        obj[element].er,
        formatUTCDate(obj[element].first_er_date),
        obj[element].transfer,
        obj[element].first_transfer_type,
        formatUTCDate(obj[element].first_transfer_date),
      ];
      arrayForDispaly.push(subList);
    }

    if (checkedMonitor === 'true' && obj[element].monitorStatus.length > 0) {
      let returnVisitFlag = false;
      obj[element].monitorStatus.forEach((ele, i) => {
        const subList = [
          element,
          formatUTCDate(obj[element].dob),
          obj[element].age,
          obj[element].race,
          obj[element].code,
          obj[element].address,
          obj[element].city,
          obj[element].state,
          obj[element].iovApptStatus === 'Completed' ? obj[element].refSource : '',
          obj[element].iovApptStatus === 'Completed' ? 'Y' : '',
          obj[element].iovApptStatus === 'Completed' ? formatUTCDate(obj[element].iovApptDate) : '',
          obj[element].iovApptStatus === 'Completed' ? obj[element].md : '',
          obj[element].iovApptStatus === 'Completed' ? r1ApptStatus : '',
          obj[element].iovApptStatus === 'Completed' ? formatUTCDate(r1ApptDate) : '',
          obj[element].iovApptStatus === 'Completed' ? r1Provider : '',
          obj[element].monitorType[i],
          ele.toUpperCase(),
          formatUTCDate(obj[element].monitorDate[i]),
          obj[element].iovApptStatus === 'Completed' &&
          obj[element].monitorDate[i] > r1ApptDate &&
          returnVisitFlag === false &&
          ele === 'Completed'
            ? 'Y'
            : '',
          obj[element].iovApptStatus === 'Completed' &&
          obj[element].monitorDate[i] > r1ApptDate &&
          returnVisitFlag === false &&
          ele === 'Completed'
            ? dateDiff(r1ApptDate, obj[element].monitorDate[i]) || ''
            : '',
        ];
        if (
          obj[element].monitorDate[i] > r1ApptDate &&
          returnVisitFlag === false &&
          ele === 'Completed'
        ) {
          returnVisitFlag = true;
        }
        arrayForDispalyMonitor.push(subList);
      });
    }

    if (checkedER === 'true' && obj[element].erStatus.length > 0) {
      obj[element].erStatus.forEach((ele, i) => {
        const subList = [
          element,
          formatUTCDate(obj[element].dob),
          obj[element].age,
          obj[element].race,
          obj[element].code,
          obj[element].address,
          obj[element].city,
          obj[element].state,
          obj[element].iovApptStatus === 'Completed' ? obj[element].refSource : '',
          obj[element].iovApptStatus === 'Completed' ? 'Y' : '',
          obj[element].iovApptStatus === 'Completed' ? formatUTCDate(obj[element].iovApptDate) : '',
          obj[element].iovApptStatus === 'Completed' ? obj[element].md : '',
          ele.toUpperCase(),
          formatUTCDate(obj[element].erDate[i]),
        ];
        arrayForDispalyER.push(subList);
      });
    }

    if (checkedTransfer === 'true' && obj[element].transferStatus.length > 0) {
      obj[element].transferStatus.forEach((ele, i) => {
        const subList = [
          element,
          formatUTCDate(obj[element].dob),
          obj[element].age,
          obj[element].race,
          obj[element].code,
          obj[element].address,
          obj[element].city,
          obj[element].state,
          obj[element].iovApptStatus === 'Completed' ? obj[element].refSource : '',
          obj[element].iovApptStatus === 'Completed' ? 'Y' : '',
          obj[element].iovApptStatus === 'Completed' ? formatUTCDate(obj[element].iovApptDate) : '',
          obj[element].iovApptStatus === 'Completed' ? obj[element].md : '',
          ele.toUpperCase(),
          obj[element].transferType[i].toUpperCase(),
          formatUTCDate(obj[element].transferDate[i]),
        ];
        arrayForDispalyTransfer.push(subList);
      });
    }
  });

  return [arrayForDispaly, arrayForDispalyMonitor, arrayForDispalyER, arrayForDispalyTransfer];
}

async function organizeArrayForCalendly(stats, inviteeList) {
  const arrayForDispaly = [];
  arrayForDispaly.push(columnTitleList);

  inviteeList.forEach((obj) => {
    const phoneWithClientFormat = formatPhoneNumber(obj.phone) || '';
    const queryKey = `${obj.name} ${obj.email.toLowerCase() || ''} ${phoneWithClientFormat}`;
    const queryEmailKey = obj.email.toLowerCase() || null;
    const queryPhoneKey = phoneWithClientFormat || null;
    let realKey;

    if (queryKey in stats === true) {
      realKey = queryKey;
    } else if (queryEmailKey && queryEmailKey in stats === true) {
      realKey = queryEmailKey;
    } else if (queryPhoneKey && queryPhoneKey in stats === true) {
      realKey = queryPhoneKey;
    } else {
      realKey = null;
    }

    const subList = [
      obj.date,
      obj.apptDate,
      obj.status,
      realKey ? stats[realKey].chart : null,
      obj.name,
      obj.phone,
      obj.email,
      obj.type,
      obj.refer,
      realKey ? stats[realKey].insurance : obj.insurance,
      obj.state,
      realKey ? 'Y' : null,
      realKey ? stats[realKey].iovApptStatus : null,
      realKey ? formatUTCDate(stats[realKey].iovApptDate) : null,
    ];
    arrayForDispaly.push(subList);
  });
  return arrayForDispaly;
}

// function checkR1(obj) {

// }

module.exports = {
  getRawTuples,
  statApp,
  statAppV2,
  statAppV3,
  statAppForCalendly,
  organizeArrayForDisplay,
  organizeArrayForDisplayV2,
  organizeArrayForDisplayV3,
  organizeArrayForCalendly,
  packDPSData,
  packCheckList,
  getERChart,
};
