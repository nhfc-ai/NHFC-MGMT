const mssql = require('../models/Mssql');

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

function calAge(dob) {
  const now = new Date();
  return (
    now.getFullYear() -
    dob.getFullYear() -
    ([now.getMonth(), now.getDate()] < [dob.getMonth(), dob.getDate()])
  );
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

async function statApp(tuples, startDateTuples) {
  const stat = {};
  for (let i = 0; i < tuples.recordset.length; i += 1) {
    // console.log([tuples.recordset[i].Birth_Date, tuples.recordset[i].Birth_Date.getFullYear(), tuples.recordset[i].Birth_Date.getMonth(), tuples.recordset[i].Birth_Date.getDate()]);
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
      };
    }

    stat[Chart].reason.push(Reason);

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
        obj[element].dob,
        obj[element].age,
        obj[element].race,
        obj[element].code,
        obj[element].address,
        obj[element].city,
        obj[element].state,
        obj[element].refSource,
        obj[element].iovApptStatus,
        obj[element].iovApptDate,
        obj[element].md,
        obj[element].r1ApptStatus,
        obj[element].r1ApptDate,
        obj[element].ivfR1,
        obj[element].ivfStartDate,
        obj[element].monitorCounter,
        obj[element].erCounter,
      ];
      arrayForDispaly.push(subList);
    }
  });
  return arrayForDispaly;
}

// function checkR1(obj) {

// }

module.exports = {
  getRawTuples,
  statApp,
  organizeArrayForDisplayV2,
};