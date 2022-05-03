const {
  getDPSDataApiMethod,
  checkExistingFileApiMethod,
  deleteExistingFileApiMethod,
} = require('../lib/api/embryology');

export const LOAD_DATA_LOADING = 'REDUX_THUNK_LOAD_DATA_LOADING';
export const LOAD_DATA_SUCCESS = 'REDUX_THUNK_LOAD_DATA_SUCCESS';
export const LOAD_DATA_ERROR = 'REDUX_THUNK_LOAD_DATA_ERROR';

export const setQueryDate = (queryDate) => ({
  type: 'SELECT_DATE',
  queryDate,
});

export const setVisibilityOption = (option) => ({
  type: 'SET_VISIBILITY_OPTION',
  option,
});

export const VisibilityOptions = {
  Today: 'Today',
  Tomorrow: 'Tomorrow',
  Overmorrow: 'Overmorrow',
};

export const VisibilityStartOverOptions = {
  START_OVER: 'START_OVER',
};

export const loadDataFromDB = (queryDate) => (dispatch, getState) => {
  dispatch({ type: LOAD_DATA_LOADING });
  const { loading } = getState();

  // if (loading === LOAD_DATA_SUCCESS) return;

  getDPSDataApiMethod({ queryDate }).then(
    (data) => dispatch({ type: LOAD_DATA_SUCCESS, data }),
    (error) => dispatch({ type: LOAD_DATA_ERROR, error: error.message || 'Unexpected Error!!!' }),
  );
};
