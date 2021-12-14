import React, { useEffect } from 'react';
// import 'react-virtualized/styles.css'; // only needs to be imported once
// import Demo from '../../components/admin/Demo2';
import Button from '@material-ui/core/Button';
import Router from 'next/router';
import { styleBackButton } from '../../components/SharedStyles';
import withAuth from '../../lib/withAuth';

const { getIovR1DataApiMethod, createGoogleSpreadsheet } = require('../../lib/api/mgmt');

// const ROOT_URL = getRootUrl();

// async function RetrieveData() {
//   const { startDate, endDate } = this.props.query;
//   const array = await getIovR1DataApiMethod({ startDate, endDate });
//   return array;
// }

// export default async function CreateGoogleSpreadsheet() {
//   const { startDate, endDate } = this.props.query;
//   // const oAuth2Client = new google.auth.OAuth2(
//   //   process.env.GOOGLE_CLIENTID,
//   //   process.env.GOOGLE_CLIENTSECRET,
//   //   `${ROOT_URL}/oauth2callback`,
//   // );
//   const sheets = google.sheets({ version: 'v4' });
//   const resource = {
//     properties: {
//       title: `iov-r1-spreadsheet-${startDate}-to-${endDate}`,
//     },
//   };
//   const spreadID = await sheets.spreadsheets.create(
//     {
//       resource,
//       fields: 'spreadsheetId',
//     },
//     (err, spreadsheet) => {
//       if (err) {
//         // Handle error.
//         console.log(err);
//         return '';
//       }
//       return spreadsheet.spreadsheetId;
//     },
//   );
//   console.log(spreadID);
//   return redirect(`https://docs.google.com/spreadsheets/d/${spreadID}/edit#gid=0`);
// }
// class getIOVStats extends React.Component {
//   static async getInitialProps(ctx) {
//     const { startDate, endDate } = ctx.query;
//     const array = await getIovR1DataApiMethod({ startDate, endDate });
//     // console.log(array);
//     return { array };
//   }

//   render() {
//     const { array } = this.props;
//     return (
//       <div style={{ padding: '10px 45px' }}>
//         <Demo array={array} />
//       </div>
//     );
//   }
// }

// export default withAuth(getIOVStats, { adminRequired: true });

class RedirectGoogleSheet extends React.Component {
  static async getInitialProps(ctx) {
    const { startDate, endDate } = ctx.query;
    const array = await getIovR1DataApiMethod({ startDate, endDate });
    // console.log(array);
    const spreadData = await createGoogleSpreadsheet({ startDate, endDate, array });
    // console.log(array);
    // console.log(spreadData);
    return { spreadID: spreadData.spreadsheetId };
    // return { spreadID: '1F1r09tyScQbkqhIxOh1THz_VQY0wa1KmMnnilqUnq8M' };
  }

  componentDidMount() {
    window.open(
      `https://docs.google.com/spreadsheets/d/${this.props.spreadID}/edit#gid=0`,
      '_blank',
    );

    setTimeout(() => {
      Router.push('/');
    }, 5000);
  }

  render() {
    return (
      <div>
        <h1>
          You are redirecting to google sheet, this page will be back to the main page after 5
          seconds.
        </h1>
      </div>
    );
  }
}

export default withAuth(RedirectGoogleSheet);
