const fetch = require('isomorphic-unfetch');
const { getState, formatDate } = require('./utils');

require('dotenv').config();

const calendlyAPIMethods = { scheduled_events: 'scheduled_events', invitees: 'invitees' };
const headers = { 'Content-Type': 'application/json', Authorization: process.env.CALENDLY_TOKEN };

async function getCalendlyEvents(url) {
  let eventList = [];
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });
  const resJson = await res.json();
  eventList = eventList.concat(resJson.collection);
  if (resJson.pagination.next_page) {
    const subCol = await getCalendlyEvents(resJson.pagination.next_page, headers);
    eventList = eventList.concat(subCol);
  }
  return eventList;
}

async function getCalendlyEventsWrapper(startTime, endTime) {
  const eventIDList = [];
  //   const headers = { 'Content-Type': 'application/json', Authorization: process.env.CALENDLY_TOKEN };
  const iniUrl = `${process.env.CALENDLY_API_URL}${calendlyAPIMethods.scheduled_events}?count=100&min_start_time=${startTime}&max_start_time=${endTime}&organization=${process.env.CALENDLY_ORGANIZATION_ID}`;
  console.log(iniUrl);
  const totalEvents = await getCalendlyEvents(iniUrl, headers);
  totalEvents.forEach((obj) => {
    eventIDList.push([obj.uri, obj.start_time]);
  });
  return eventIDList;
}

function collectInviteeInfo(col) {
  const infoObj = { phone: null, dob: null, state: null, request: null, refer: null, type: null };
  col.forEach((obj) => {
    const question = obj.question.replace(/\s/g, '');
    if (question === 'PhoneNumber') {
      infoObj.phone = obj.answer;
    }

    if (question === 'DateofBirth') {
      infoObj.dob = obj.answer;
    }

    if (question === 'ZipCode') {
      //   const st = getState(obj.answer);
      infoObj.state = getState(obj.answer);
    }

    if (question === 'Whattreatmentdoyouneed?(selectallthatapply)') {
      infoObj.request = obj.answer;
    }

    if (question === 'AppointmentType') {
      infoObj.type = obj.answer;
    }

    if (question === 'Howdidyouhearaboutus?') {
      infoObj.refer = obj.answer;
    }
  });
  return infoObj;
}

async function getEventInvitees(startTime, endTime) {
  const eventIDList = await getCalendlyEventsWrapper(startTime, endTime);
  //   console.log(eventIDList.length);
  const calendlyAppts = [];
  await Promise.all(
    eventIDList.map(async ([id, start_time]) => {
      // console.log(id);
      const url = `${id}/invitees`;
      const res = await fetch(url, {
        method: 'GET',
        headers,
      });
      const resJson = await res.json();
      if (resJson.pagination.count > 1) {
        console.log(`${id} has multi invitees!`);
      } else {
        const obj = resJson.collection.pop();
        //   console.log(obj);
        const infoObj = await collectInviteeInfo(obj.questions_and_answers);
        infoObj.id = id;
        infoObj.name = obj.name;
        infoObj.email = obj.email;
        infoObj.status = obj.status;
        infoObj.date = formatDate(new Date(obj.created_at));
        infoObj.apptDate = formatDate(new Date(start_time));
        //   console.log(infoObj);
        calendlyAppts.push(infoObj);
      }
    }),
  );

  return calendlyAppts;
}

module.exports = { getEventInvitees };
