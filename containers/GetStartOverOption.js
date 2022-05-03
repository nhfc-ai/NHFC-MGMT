import { connect } from 'react-redux';
import { setVisibilityOption, VisibilityStartOverOptions } from '../actions';
import StartOverOption from '../components/embryology/StartOverOption';

const mapStateToProps = (state, ownProps) => ({
  startOver: ownProps.option === state.visibilityOption,
  variant: ownProps.variant,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(setVisibilityOption(ownProps.option)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StartOverOption);
