import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import notify from '../../lib/notify';
import withAuth from '../../lib/withAuth';
import GetIOVStats from '../../components/mgmt/GetIOVStat';
import { formatDate } from '../../lib/utils';

// import { styleTextField } from '../../components/SharedStyles';

class IOV extends React.Component {
  setDateOnSave = async (startDate, endDate, checkedMonitor, checkedER, checkedTransfer) => {
    NProgress.start();
    try {
      console.log([
        formatDate(startDate),
        formatDate(endDate),
        checkedMonitor,
        checkedER,
        checkedTransfer,
      ]);
      Router.push(
        `/mgmt/iov-r1-spreadsheet?startDate=${formatDate(startDate)}&endDate=${formatDate(
          endDate,
        )}&checkedMonitor=${checkedMonitor}&checkedER=${checkedER}&checkedTransfer=${checkedTransfer}`,
        `/mgmt/iov-r1-spreadsheet?startDate=${formatDate(startDate)}&endDate=${formatDate(
          endDate,
        )}&checkedMonitor=${checkedMonitor}&checkedER=${checkedER}&checkedTransfer=${checkedTransfer}`,
      );
      // Router.push(`www.google.com`, `www.google.com`);
      NProgress.done();
    } catch (err) {
      notify(err.message || err.toString());
      NProgress.done();
    }
  };

  render() {
    return (
      <div style={{ padding: '10px 45px' }}>
        <GetIOVStats onSave={this.setDateOnSave} />
      </div>
    );
  }
}

export default withAuth(IOV, { managementRequired: true });
