import sendRequest from './sendRequest';

const BASE_PATH = '/api/v1/embryology';

export const getDPSDataApiMethod = ({ queryDate }, options = {}) =>
  sendRequest(`${BASE_PATH}/get-dps?queryDate=${queryDate}`, {
    method: 'GET',
    ...options,
  });

export const checkExistingFileApiMethod = async ({ filePath }) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const response = await fetch(`/check_existing_file`, {
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify({
      filePath,
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

export const deleteExistingFileApiMethod = async ({ filePath }) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const response = await fetch(`/delete_existing_file`, {
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify({
      filePath,
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
