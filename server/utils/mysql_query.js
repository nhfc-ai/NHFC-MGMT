function processFolliclesString(folStr) {
  const folObj = JSON.parse(folStr);
  //   console.log(folObj);
  const leftFolArray = folObj.L.split(', ');
  const rightFolArray = folObj.R.split(', ');
  let leftCount = 0;
  let rightCount = 0;
  leftFolArray.forEach((ele) => {
    if (parseInt(ele, 10) >= 14) {
      leftCount += 1;
    }
  });
  rightFolArray.forEach((ele) => {
    if (parseInt(ele, 10) >= 14) {
      rightCount += 1;
    }
  });
  //   console.log([leftCount, rightCount]);
  return [leftCount, rightCount];
}

function filterTriggerTime(drDcsnStr) {
  const idx = drDcsnStr.indexOf('Trigger Time ');
  if (idx === -1) {
    return '';
  }
  return drDcsnStr.substring(idx + 13, idx + 20).trim();
}

function parseTwelveTime(value) {
  if (value === '') {
    return value;
  }
  const timeUpCase = value.trim().toUpperCase();
  const flagIndex = timeUpCase.indexOf('M');
  const timePureNum = timeUpCase.slice(0, flagIndex-1);
  let [h, m] = timePureNum.split(':');
  if (timeUpCase.slice(flagIndex - 1, flagIndex + 1) === 'AM') {
    h = h.length === 1 ? `0${h}` : h;
    return `${h}:${m}`;
  }
  h = parseInt(h, 10) + 12;
  return `${h}:${m}`;
}

async function packTriggerData(triggerTuples) {
  //   console.log(triggerTuples);
  const outObj = {};
  for (let i = 0; i < triggerTuples.length; i += 1) {
    // console.log([
    //   tuples.recordset[i].Birth_Date,
    //   tuples.recordset[i].Birth_Date.getFullYear(),
    //   tuples.recordset[i].Birth_Date.getMonth(),
    //   tuples.recordset[i].Birth_Date.getDate(),
    // ]);
    const { patient_id_id, date, estrogen, progesterone, follicles, doctor_decision } =
      triggerTuples[i];
    const folCount = processFolliclesString(follicles);
    // if (Reason.toUpperCase().startsWith('IOV') === false) {
    //   continue;
    // }
    if (parseInt(patient_id_id, 10) in outObj === false) {
      outObj[parseInt(patient_id_id, 10)] = {
        l: folCount[0],
        r: folCount[1],
        trgt: parseTwelveTime(filterTriggerTime(doctor_decision)),
      };
    }
  }

  return outObj;
}

module.exports = {
  packTriggerData,
};
