import { combineReducers } from 'redux';
import visibilityOption from './visibilityOption';
import loadDataFromDB from './loadDataFromDB';
// import processExistingFile from './processExistingFile';

export default combineReducers({
  loadDataFromDB,
  visibilityOption,
});
