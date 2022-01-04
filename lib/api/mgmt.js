import sendRequest from './sendRequest';

// const fetch = require('node-fetch');

const BASE_PATH = '/api/v1/mgmt';

export const getIovR1DataApiMethod = ({ startDate, endDate }, options = {}) =>
  sendRequest(`${BASE_PATH}/get-iov-r1-spreadsheet?startDate=${startDate}&endDate=${endDate}`, {
    method: 'GET',
    ...options,
  });

export const getIovCalendlyDataApiMethod = ({ date }, options = {}) =>
  sendRequest(`${BASE_PATH}/get-monthly-calendly-stats-spreadsheet?date=${date}`, {
    method: 'GET',
    ...options,
  });

export const createGoogleSpreadsheet = async ({ startDate, endDate, array }) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const response = await fetch(`/create-iov-r1-spreadsheet`, {
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify({
      startDate,
      endDate,
      array,
    }),
  });
  // console.log(response);
  // return response;
  // console.log(response);
  const resData = await response.json();
  // console.log(resData);

  if (resData.error) {
    throw new Error(resData.error);
  }
  return resData;
  //
};

export const createIOVCalendlyGoogleSpreadsheet = async ({ date, array }) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const response = await fetch(`/create-iov-calendly-spreadsheet`, {
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify({
      date,
      array,
    }),
  });
  // console.log(response);
  // return response;
  // console.log(response);
  const resData = await response.json();
  // console.log(resData);

  if (resData.error) {
    throw new Error(resData.error);
  }
  return resData;
  //
};
