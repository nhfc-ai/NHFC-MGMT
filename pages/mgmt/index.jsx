import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import withAuth from '../../lib/withAuth';

const propTypes = {
  functions: PropTypes.objectOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

const Index = ({ functions }) => (
  <div style={{ padding: '10px 45px' }}>
    <div>
      <h2>Functions</h2>
      <p />
      <ul>
        {Object.keys(functions).map((key) => (
          <li>
            <Link as={`/mgmt/${key}`} href={`/mgmt/${functions[key]}`}>
              <a>{key}</a>
            </Link>
          </li>
        ))}
      </ul>
      <br />
    </div>
  </div>
);

Index.propTypes = propTypes;

const propTypes2 = {
  errorMessage: PropTypes.string,
};

const defaultProps2 = {
  errorMessage: null,
};

class IndexWithData extends React.Component {
  static getInitialProps({ query }) {
    return { errorMessage: query.error };
  }

  constructor(props) {
    super(props);

    this.state = {
      // functions: ['iovStats', 'iovFollowUp', 'r1FollowUp'],
      functions: {
        'IOV R1 Statistics': 'iovStats',
        'IOV Follow Up': 'iovFollowUp',
        'R1 Follow Up': 'r1FollowUp',
      },
    };
  }

  // async componentDidMount() {
  //   if (this.props.errorMessage) {
  //     notify(this.props.errorMessage);
  //   }

  //   try {
  //     const { books } = await getBookListApiMethod();
  //     this.setState({ books }); // eslint-disable-line
  //   } catch (err) {
  //     notify(err);
  //   }
  // }

  render() {
    return <Index {...this.state} />;
  }
}

IndexWithData.propTypes = propTypes2;
IndexWithData.defaultProps = defaultProps2;

export default withAuth(IndexWithData, { managementRequired: true });
