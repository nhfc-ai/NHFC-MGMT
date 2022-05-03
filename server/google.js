const passport = require('passport');
// const googleStrategy = require('passport-google').Strategy;
const { Strategy } = require('passport-google-oauth2');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const { dateColumns } = require('./utils/mssql_cmd');
const {
  convertIntegerToCapLetter,
  organizeIovR1DataForChart,
  organizeCalendlyFullModeData,
  sendEmail,
  iovR1MainTable,
} = require('./utils/utils');

const User = require('./models/User');
const { Group } = require('./models/Group');

function setupGoogle({ server, ROOT_URL }) {
  const verify = async (request, accessToken, refreshToken, profile, verified) => {
    let email;
    let avatarUrl;

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128');
    }

    try {
      const userGroup = (await Group.findOne({ where: { email } })).group || 'other';
      console.log([
        profile.id,
        email,
        accessToken,
        refreshToken,
        profile.displayName,
        userGroup,
        avatarUrl,
      ]);
      const user = await User.signInOrSignUp({
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken },
        displayName: profile.displayName,
        department: userGroup,
        avatarUrl,
        isManagement: userGroup === 'management',
        isEmbryology: userGroup === 'embryology',
      });
      verified(null, user);
    } catch (err) {
      verified(err);
      console.log(err);
    }
  };

  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_DEV_CLIENTID,
        clientSecret: process.env.GOOGLE_DEV_CLIENTSECRET,
        callbackURL: `${ROOT_URL}/oauth2callback`,
        passReqToCallback: true,
      },
      verify,
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // passport.deserializeUser((id, done) => {
  //   User.findById(id, User.publicFields(), (err, user) => {
  //     done(err, user);
  //   });
  // });

  passport.deserializeUser((id, done) => {
    User.findByPk(id, { attributes: User.publicFields() })
      .then((data) => {
        done(null, data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  server.use(passport.initialize());
  server.use(passport.session());

  server.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/gmail.send',
        'https://mail.google.com/',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.compose',
      ],
      prompt: 'consent',
      accessType: 'offline',
    }),
  );

  // server.get(
  //   '/oauth2callback',
  //   passport.authenticate('google', {
  //     failureRedirect: '/login',
  //   }),
  //   (_, res) => {
  //     res.redirect('/');
  //   },
  // );

  server.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      // eslint-disable-next-line
      // console.log(`req.session.finalUrl:${req.session.finalUrl}`);
      // console.log([req.user, req.user.isManagement]);
      if (req.user && req.user.isAdmin) {
        res.redirect('/admin');
      } else if (req.user && req.user.isManagement) {
        res.redirect(`/mgmt`);
      } else if (req.session.finalUrl) {
        res.redirect(`${ROOT_URL}${req.session.finalUrl}`);
      } else {
        res.redirect('/');
      }
    },
  );

  server.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });

  server.post('/send-gmail-email', async (req, res) => {
    try {
      const userObj = await User.findByPk(req.user.id);
      // console.log(userObj.email);
      // console.log([req.body.subject, req.body.content]);

      const sendEmailRes = await sendEmail(
        userObj,
        process.env.DEVELOPER_EMAIL_ADDRESS,
        req.body.subject,
        req.body.content,
        false,
      );
      res.json(sendEmailRes);

      // const oauth2Client = new OAuth2Client(
      //   process.env.GOOGLE_CLIENTID,
      //   process.env.GOOGLE_CLIENTSECRET,
      //   `${ROOT_URL}/oauth2callback`,
      // );

      // oauth2Client.setCredentials({
      //   access_token: userObj.googleAccessToken,
      //   refresh_token: userObj.googleRefreshToken,
      // });

      // const gmail = google.gmail({ version: 'v1', oauth2Client });

      // const str = [
      //   'Content-Type: text/plain; charset="UTF-8"\n',
      //   'MIME-Version: 1.0\n',
      //   'Content-Transfer-Encoding: 7bit\n',
      //   'to: ',
      //   userObj.email,
      //   '\n',
      //   'from: ',
      //   userObj.email,
      //   '\n',
      //   'subject: ',
      //   req.body.subject,
      //   '\n\n',
      //   req.body.message,
      // ].join('');

      // const encodedMail = str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      // gmail.users.messages.send(
      //   {
      //     userId: 'me',
      //     resource: {
      //       raw: encodedMail,
      //     },
      //   },
      //   (err, response) => {
      //     res.send(err || response);
      //   },
      // );
    } catch (err) {
      console.error(err);
      res.json({ error: err.message || err.toString() });
    }
  });

  server.post('/create-iov-r1-spreadsheet', async (req, res) => {
    try {
      //
      // create blank spreadsheet
      //
      const userObj = await User.findByPk(req.user.id);

      const { checkedMonitor, checkedER, checkedTransfer } = req.body;

      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_DEV_CLIENTID,
        process.env.GOOGLE_DEV_CLIENTSECRET,
        `${ROOT_URL}/oauth2callback`,
      );

      oauth2Client.setCredentials({
        access_token: userObj.googleAccessToken,
        refresh_token: userObj.googleRefreshToken,
      });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      const resource = {
        properties: {
          title: `iov-r1-spreadsheet-${req.body.startDate}-to-${req.body.endDate}`,
        },
      };

      const response = (await sheets.spreadsheets.create({ resource })).data;

      const requests = [
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              title: 'Main Table',
            },
            fields: 'title',
          },
        },
        // {
        //   addSheet: {
        //     properties: {
        //       sheetId: 1,
        //       title: 'Monthly Statistic Chart',
        //     },
        //   },
        // },
      ];

      //
      // end of create blank spreadsheet
      //
      // console.log(req.body.array);
      const [arrayMain, arrayMonitor, arrayER, arrayTransfer] = req.body.array;
      // console.log([arrayMain.length, arrayMonitor.length, arrayER.length, arrayTransfer.length]);
      //
      // inject spreadsheet data
      //
      // main data

      const columnList = arrayMain[0];

      const lastColumn = convertIntegerToCapLetter(columnList.length);

      const dataRange = `Main Table!A1:${lastColumn}${arrayMain.length}`;

      for (let i = 0; i < dateColumns.length; i += 1) {
        requests.push({
          repeatCell: {
            range: {
              startRowIndex: 1,
              endRowIndex: arrayMain.length - 1,
              startColumnIndex: columnList.indexOf(dateColumns[i]),
              endColumnIndex: columnList.indexOf(dateColumns[i]) + 1,
            },
            cell: {
              userEnteredFormat: {
                numberFormat: {
                  type: 'DATE',
                  pattern: 'mm/dd/yyyy',
                },
              },
            },
            fields: 'userEnteredFormat.numberFormat',
          },
        });
      }

      // chart data

      // const chartData2dArray = await organizeIovR1DataForChart(arrayMain);
      // console.log(chartData2dArray);
      // const chartColumnList = chartData2dArray[0];
      // const chartLastColumn = convertIntegerToCapLetter(chartColumnList.length);

      // const chartDataRange = `Monthly Statistic Chart!A1:${chartLastColumn}${chartData2dArray.length}`;

      const valuesBody = {
        resource: {
          data: [
            {
              range: dataRange,
              majorDimension: 'ROWS',
              values: arrayMain,
            },
            // { range: chartDataRange, majorDimension: 'ROWS', values: chartData2dArray },
          ],
          valueInputOption: 'RAW',
        },
        spreadsheetId: response.spreadsheetId,
      };

      // requests.push({
      //   addChart: {
      //     chart: {
      //       spec: {
      //         title: 'IOV and IVF R1 Monthly Statistics',
      //         basicChart: {
      //           chartType: 'COLUMN',
      //           legendPosition: 'BOTTOM-LEGEND',
      //           axis: [
      //             {
      //               position: 'BOTTOM_AXIS',
      //               title: 'Calendar Months',
      //             },
      //             {
      //               position: 'LEFT_AXIS',
      //               title: 'Count',
      //             },
      //           ],
      //           domains: [
      //             {
      //               domain: {
      //                 sourceRange: {
      //                   sources: [
      //                     {
      //                       sheetId: 1,
      //                       startRowIndex: 0,
      //                       endRowIndex: chartData2dArray.length,
      //                       startColumnIndex: 0,
      //                       endColumnIndex: 1,
      //                     },
      //                   ],
      //                 },
      //               },
      //             },
      //           ],
      //           series: [
      //             {
      //               series: {
      //                 sourceRange: {
      //                   sources: [
      //                     {
      //                       sheetId: 1,
      //                       startRowIndex: 0,
      //                       endRowIndex: chartData2dArray.length,
      //                       startColumnIndex: 1,
      //                       endColumnIndex: 2,
      //                     },
      //                   ],
      //                 },
      //               },
      //               targetAxis: 'LEFT_AXIS',
      //             },
      //             {
      //               series: {
      //                 sourceRange: {
      //                   sources: [
      //                     {
      //                       sheetId: 1,
      //                       startRowIndex: 0,
      //                       endRowIndex: chartData2dArray.length,
      //                       startColumnIndex: 2,
      //                       endColumnIndex: 3,
      //                     },
      //                   ],
      //                 },
      //               },
      //               targetAxis: 'LEFT_AXIS',
      //             },
      //             {
      //               series: {
      //                 sourceRange: {
      //                   sources: [
      //                     {
      //                       sheetId: 1,
      //                       startRowIndex: 0,
      //                       endRowIndex: chartData2dArray.length,
      //                       startColumnIndex: 3,
      //                       endColumnIndex: 4,
      //                     },
      //                   ],
      //                 },
      //               },
      //               targetAxis: 'LEFT_AXIS',
      //             },
      //           ],
      //           headerCount: 1,
      //         },
      //       },
      //       position: {
      //         overlayPosition: {
      //           anchorCell: {
      //             sheetId: 1,
      //             rowIndex: 0,
      //             columnIndex: 4,
      //           },
      //         },
      //       },
      //     },
      //   },
      // });
      //

      // for Moniter sheet
      if (checkedMonitor === 'true') {
        const arrayMonitorColumnList = arrayMonitor[0];
        const arrayMonitorLastColumn = convertIntegerToCapLetter(arrayMonitorColumnList.length);
        const arrayMonitorTitle = 'Monitor Appt Table';
        requests.push({
          addSheet: {
            properties: {
              sheetId: 2,
              title: arrayMonitorTitle,
            },
          },
        });
        const arrayMonitorDataRange = `${arrayMonitorTitle}!A1:${arrayMonitorLastColumn}${arrayMonitor.length}`;
        valuesBody.resource.data.push({
          range: arrayMonitorDataRange,
          majorDimension: 'ROWS',
          values: arrayMonitor,
        });
      }
      // end of Moniter sheet

      // for ER sheet
      if (checkedER === 'true') {
        const arrayERColumnList = arrayER[0];
        const arrayERLastColumn = convertIntegerToCapLetter(arrayERColumnList.length);
        const arrayERTitle = 'ER Appt Table';
        requests.push({
          addSheet: {
            properties: {
              sheetId: 3,
              title: arrayERTitle,
            },
          },
        });
        const arrayERDataRange = `${arrayERTitle}!A1:${arrayERLastColumn}${arrayER.length}`;
        valuesBody.resource.data.push({
          range: arrayERDataRange,
          majorDimension: 'ROWS',
          values: arrayER,
        });
      }
      // end of ER sheet

      // for Transfer sheet
      if (checkedTransfer === 'true') {
        const arrayTransferColumnList = arrayTransfer[0];
        const arrayTransferLastColumn = convertIntegerToCapLetter(arrayTransferColumnList.length);
        const arrayTransferTitle = 'Transfer Appt Table';
        requests.push({
          addSheet: {
            properties: {
              sheetId: 4,
              title: arrayTransferTitle,
            },
          },
        });
        const arrayTransferDataRange = `${arrayTransferTitle}!A1:${arrayTransferLastColumn}${arrayTransfer.length}`;
        valuesBody.resource.data.push({
          range: arrayTransferDataRange,
          majorDimension: 'ROWS',
          values: arrayTransfer,
        });
      }
      // end of Transfer sheet

      const sheetBody = {
        resource: { requests },
        spreadsheetId: response.spreadsheetId,
      };
      //
      // end of inject spreadsheet data
      //
      try {
        const sheetResponseUpdate = (await sheets.spreadsheets.batchUpdate(sheetBody)).data;
        // console.log(JSON.stringify(sheetResponseUpdate, null, 2));
        const valueResponseUpdate = (await sheets.spreadsheets.values.batchUpdate(valuesBody)).data;
        // console.log(JSON.stringify(valueResponseUpdate, null, 2));
      } catch (err) {
        console.error(err);
      }
      res.json(response);
    } catch (err) {
      console.error(err);
      res.json({ error: err.message || err.toString() });
    }
  });

  server.post('/create-iov-calendly-spreadsheet', async (req, res) => {
    try {
      //
      // create blank spreadsheet
      //
      const userObj = await User.findByPk(req.user.id);

      const fullMode = req.body.checked;
      const dateObj = new Date(req.body.date);
      console.log([fullMode, req.body.date]);
      let prunedArray = [];
      let chartArray = [];

      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_DEV_CLIENTID,
        process.env.GOOGLE_DEV_CLIENTSECRET,
        `${ROOT_URL}/oauth2callback`,
      );

      oauth2Client.setCredentials({
        access_token: userObj.googleAccessToken,
        refresh_token: userObj.googleRefreshToken,
      });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      const sheetBaseTitle = `iov-calendly-spreadsheet-${req.body.date.substring(0, 7)}`;
      const resource = {
        properties: {
          title: fullMode === 'true' ? `${sheetBaseTitle}-groupby-created-date` : sheetBaseTitle,
        },
      };

      const response = (await sheets.spreadsheets.create({ resource })).data;

      const requests = [
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              title: 'Main Table',
            },
            fields: 'title',
          },
        },
      ];

      //
      // end of create blank spreadsheet
      //

      //
      // inject spreadsheet data
      //
      // main data
      if (fullMode === 'true') {
        [prunedArray, chartArray] = await organizeCalendlyFullModeData(req.body.array, dateObj);
      }
      const columnList = req.body.array[0];
      const lastColumn = convertIntegerToCapLetter(columnList.length);
      const rowLength = fullMode === 'true' ? prunedArray.length : req.body.array.length;

      const dataRange = `Main Table!A1:${lastColumn}${rowLength}`;

      const valuesBody = {
        resource: {
          data: [
            {
              range: dataRange,
              majorDimension: 'ROWS',
              values: fullMode === 'true' ? prunedArray : req.body.array,
            },
          ],
          valueInputOption: 'RAW',
        },
        spreadsheetId: response.spreadsheetId,
      };

      // chart data
      if (fullMode === 'true') {
        requests.push({
          addSheet: {
            properties: {
              sheetId: 1,
              title: 'Monthly Statistic Chart',
            },
          },
        });

        const chartColumnList = chartArray[0];
        const chartLastColumn = convertIntegerToCapLetter(chartColumnList.length);

        const chartDataRange = `Monthly Statistic Chart!A1:${chartLastColumn}${chartArray.length}`;

        valuesBody.resource.data.push({
          range: chartDataRange,
          majorDimension: 'ROWS',
          values: chartArray,
        });

        requests.push({
          addChart: {
            chart: {
              spec: {
                title: 'Calendly Monthly Statistics',
                basicChart: {
                  chartType: 'COLUMN',
                  legendPosition: 'BOTTOM-LEGEND',
                  axis: [
                    {
                      position: 'BOTTOM_AXIS',
                      title: 'Calendar Months',
                    },
                    {
                      position: 'LEFT_AXIS',
                      title: 'Count',
                    },
                  ],
                  domains: [
                    {
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: 1,
                              startRowIndex: 0,
                              endRowIndex: chartArray.length,
                              startColumnIndex: 0,
                              endColumnIndex: 1,
                            },
                          ],
                        },
                      },
                    },
                  ],
                  series: [
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: 1,
                              startRowIndex: 0,
                              endRowIndex: chartArray.length,
                              startColumnIndex: 1,
                              endColumnIndex: 2,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: 1,
                              startRowIndex: 0,
                              endRowIndex: chartArray.length,
                              startColumnIndex: 2,
                              endColumnIndex: 3,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                  ],
                  headerCount: 1,
                },
              },
              position: {
                overlayPosition: {
                  anchorCell: {
                    sheetId: 1,
                    rowIndex: 0,
                    columnIndex: 4,
                  },
                },
              },
            },
          },
        });
        //
      }

      const sheetBody = {
        resource: { requests },
        spreadsheetId: response.spreadsheetId,
      };
      //
      // end of inject spreadsheet data
      //

      try {
        const sheetResponseUpdate = (await sheets.spreadsheets.batchUpdate(sheetBody)).data;
        // console.log(JSON.stringify(sheetResponseUpdate, null, 2));
        const valueResponseUpdate = (await sheets.spreadsheets.values.batchUpdate(valuesBody)).data;
        // console.log(JSON.stringify(valueResponseUpdate, null, 2));
      } catch (err) {
        console.error(err);
      }

      // const spreadsheetData = await sheets.spreadsheets.create(
      //   {
      //     resource,
      //     fields: 'spreadsheetId',
      //   },
      //   (err, spreadsheet) => {
      //     if (err) {
      //       // Handle error.
      //       console.log(err);
      //     }
      //     console.log(spreadsheet.data);
      //   },
      // ).data;
      // console.log(response);
      res.json(response);
    } catch (err) {
      console.error(err);
      res.json({ error: err.message || err.toString() });
    }
  });
}

module.exports = setupGoogle;
