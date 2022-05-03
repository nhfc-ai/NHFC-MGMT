import { connect } from 'react-redux';
import { setVisibilityOption, VisibilityOptions, VisibilityStartOverOptions } from '../actions';
import Option from '../components/embryology/Option';

const mapStateToProps = (state, ownProps) => ({
  active: state.visibilityOption !== VisibilityStartOverOptions.START_OVER,
  variant: ownProps.variant,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(setVisibilityOption(ownProps.option)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Option);
