import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import withAuth from '../lib/withAuth';

const propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }),
};

const defaultProps = {
  user: null,
};

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  render() {
    const { user } = this.props;

    if (user.isManagement || user.isAdmin) {
      return null;
    }
    return (
      <div style={{ padding: '10px 45px' }}>
        <Head>
          <title>Welcome to NHFC MGMT Web Services</title>
        </Head>
        <p>
          Only functions for the management team are online now, please email jia.wang@nhfc.com for
          more information.
        </p>
      </div>
    );
  }
}

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;

export default withAuth(Index);
