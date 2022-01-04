import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import notify from '../../lib/notify';
import withAuth from '../../lib/withAuth';
import GetIOVCalendly from '../../components/mgmt/GetIOVCalendly';
import { formatDate } from '../../lib/utils';

// import { styleTextField } from '../../components/SharedStyles';

class IOVCanlendly extends React.Component {
  setDateOnSave = async (date) => {
    NProgress.start();
    try {
      console.log(`iovCalendly ${formatDate(date)}`);
      Router.push(
        `/mgmt/iov-calendly-spreadsheet?date=${formatDate(date)}`,
        `/mgmt/iov-calendly-spreadsheet?date=${formatDate(date)}`,
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
        <GetIOVCalendly onSave={this.setDateOnSave} />
      </div>
    );
  }
}

export default withAuth(IOVCanlendly, { managementRequired: true });
