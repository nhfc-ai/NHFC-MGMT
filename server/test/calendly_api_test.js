const fetch = require('isomorphic-unfetch');
const { getEventInvitees } = require('../utils/calendly_api');
require('dotenv').config();

async function test() {
  const haha = await getEventInvitees('2022-01-01T00:00:00Z', '2022-01-31T23:59:59Z');

  console.log(haha);
  //   const url = `https://api.calendly.com/scheduled_events?count=100&min_start_time=2021-12-01T00:00:00Z&max_start_time=2021-12-31T23:59:59Z&organization=https://api.calendly.com/organizations/c72ec6ab-79f7-4e12-ba20-a9509ab81160`;
  //   const headers = { 'Content-Type': 'application/json', Authorization: process.env.CALENDLY_TOKEN };
  //   const res = await fetch(url, { method: 'GET', headers });
  //   const haha = await res.json();

  //   console.log(haha.collection);
}

test();
