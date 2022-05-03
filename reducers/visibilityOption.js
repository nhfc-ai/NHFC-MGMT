import { VisibilityOptions, VisibilityStartOverOptions } from '../actions';

const visibilityOption = (state = VisibilityStartOverOptions.START_OVER, action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_OPTION':
      return action.option;
    default:
      return state;
  }
};

export default visibilityOption;
