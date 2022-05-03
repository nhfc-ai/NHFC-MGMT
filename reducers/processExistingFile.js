import {
  FILE_IN_PROGRESS,
  FILE_CHECK_SUCCESS,
  FILE_CHECK_ERROR,
  FILE_DELETE_SUCCESS,
  FILE_DELETE_ERROR,
} from '../actions';

const initialState = { fsFlagProp: '', loading: false, fsStatus: false };

export default function processExistingFile(state = initialState, action) {
  switch (action.type) {
    case FILE_IN_PROGRESS: {
      return {
        ...state,
        fsFlagProp: action.data,
        loading: true,
        error: '',
        fsStatus: false,
      };
    }
    case FILE_CHECK_SUCCESS: {
      return {
        ...state,
        fsFlagProp: 'check',
        loading: false,
        fsStatus: action.data,
      };
    }
    case FILE_CHECK_ERROR: {
      return {
        ...state,
        fsFlagProp: 'check',
        loading: false,
        error: action.error,
      };
    }
    case FILE_DELETE_SUCCESS: {
      return {
        ...state,
        fsFlagProp: 'delete',
        loading: false,
        fsStatus: action.data,
      };
    }
    case FILE_DELETE_ERROR: {
      return {
        ...state,
        fsFlagProp: 'delete',
        loading: false,
        error: action.error,
      };
    }
    default: {
      return state;
    }
  }
}
