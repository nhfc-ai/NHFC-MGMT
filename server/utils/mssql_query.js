const mssql = require('../models/Mssql');
const { formatPhoneNumber, formatDate } = require('./utils');

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

async function organizeArrayForCalendly(stats, inviteeList) {
  const arrayForDispaly = [];
  const columnTitleList = [
    'Created Date',
    'Booked Date',
    'Calendly Appt Status',
    'Name',
    'Appt Type',
    'Referral Source',
    'State',
    'IOV Confirmed',
    'Latest IOV Status',
    'Latest IOV Date',
  ];
  arrayForDispaly.push(columnTitleList);

  inviteeList.forEach((obj) => {
    const phoneWithClientFormat = formatPhoneNumber(obj.phone);
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
      obj.name,
      obj.type,
      obj.refer,
      obj.state,
      realKey ? 'Y' : null,
      realKey ? stats[realKey].iovApptStatus : null,
      realKey ? formatDate(stats[realKey].iovApptDate) : null,
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
  statAppForCalendly,
  organizeArrayForDisplay,
  organizeArrayForDisplayV2,
  organizeArrayForCalendly,
};
