import sendRequest from './sendRequest';

// const fetch = require('node-fetch');

const BASE_PATH = '/api/v1/mgmt';

export const getIovR1DataApiMethod = ({ startDate, endDate }, options = {}) =>
  sendRequest(`${BASE_PATH}/get-iov-r1-spreadsheet?startDate=${startDate}&endDate=${endDate}`, {
    method: 'GET',
    ...options,
  });

export const createGoogleSpreadsheet = async ({ startDate, endDate, array }) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const response = await fetch(`/create-google-spreadsheet`, {
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
  console.log(response);
  const resData = await response.json();
  console.log(resData);

  if (resData.error) {
    throw new Error(resData.error);
  }
  return resData;
  //
};
