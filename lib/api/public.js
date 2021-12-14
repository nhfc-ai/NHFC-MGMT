export const sendEmailByGmailAPI = async ({ subject, content }) => {
  // console.log(['sendEmailByGmailAPI', subject, content]);
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const response = await fetch(`/send-gmail-email`, {
    method: 'POST',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify({
      subject,
      content,
    }),
  });
  // console.log(response);
  // return response;
  console.log(response);
  // const resData = await response.json();
  // console.log(resData);

  if (response.error) {
    throw new Error(response.error);
  }
  return response;
  //
};
