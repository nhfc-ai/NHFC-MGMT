import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

let globalUser = null;

export default function withAuth(
  BaseComponent,
  {
    loginRequired = true,
    logoutRequired = false,
    adminRequired = false,
    managementRequired = false,
    embryologyRequired = false,
    contactRequired = false,
  } = {},
) {
  const propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      isAdmin: PropTypes.bool,
      isManagement: PropTypes.bool,
      isEmbryology: PropTypes.bool,
    }),
    isFromServer: PropTypes.bool.isRequired,
  };

  const defaultProps = {
    user: null,
  };

  class App extends React.Component {
    static async getInitialProps(ctx) {
      const isFromServer = typeof window === 'undefined';
      const user = ctx.req ? ctx.req.user : globalUser;

      if (isFromServer && user) {
        user.id = user.id.toString();
      }

      const props = { user, isFromServer };

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      const { user, isFromServer } = this.props;

      if (isFromServer) {
        globalUser = user;
      }

      if (!contactRequired) {
        if (!managementRequired && user && user.isManagement) {
          Router.push('/mgmt/');
        }

        if (!embryologyRequired && user && user.isEmbryology) {
          Router.push('/embryology/');
        }

        if (loginRequired && !logoutRequired && !user) {
          Router.push('/login');
          return;
        }

        if (adminRequired && (!user || !user.isAdmin)) {
          Router.push('/');
        }

        if (managementRequired && (!user || !user.isManagement)) {
          Router.push('/');
        }

        if (logoutRequired && user) {
          Router.push('/');
        }
      }
    }

    render() {
      const { user } = this.props;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return (
        <>
          <BaseComponent {...this.props} />
        </>
      );
    }
  }

  App.propTypes = propTypes;
  App.defaultProps = defaultProps;

  return App;
}
