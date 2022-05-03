import React from 'react';
import thunk from 'redux-thunk';
import Router from 'next/router';
import NProgress from 'nprogress';

import { styled, createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';

import Console from '../../containers/Console';
import VisibleTable from '../../containers/VisibleTable';
// import Table from '../../components/embryology/Table';
import withAuth from '../../lib/withAuth';
import notify from '../../lib/notify';

import rootReducer from '../../reducers';

// const store = createStore(rootReducer);
const store = createStore(rootReducer, compose(applyMiddleware(thunk)));

// class DashboardContent extends React.Component {
function DPS() {
  //   render() {
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <Container maxWidth="xl" disableGutters sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Console */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 70,
                }}
              >
                <Console />
              </Paper>
            </Grid>
            {/* VisibleTable */}
          </Grid>
          <VisibleTable />
        </Container>
      </StyledEngineProvider>
    </Provider>
  );
  //   }
}

export default withAuth(DPS, { embryologyRequired: true });
