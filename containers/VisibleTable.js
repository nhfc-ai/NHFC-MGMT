import { connect } from 'react-redux';
import { VisibilityOptions, VisibilityStartOverOptions, loadDataFromDB } from '../actions';
import { formatDate, formatDateWithIncrDays } from '../lib/utils';
import Table from '../components/embryology/Table';

const getVisibleOption = (option) => {
  switch (option) {
    case VisibilityOptions.Today:
      return formatDate(new Date());
    case VisibilityOptions.Tomorrow:
      return formatDateWithIncrDays(new Date(), 1);
    case VisibilityOptions.Overmorrow:
      return formatDateWithIncrDays(new Date(), 2);
    case VisibilityStartOverOptions.START_OVER:
      return '';
    default:
      throw new Error(`Unknown option: ${option}`);
  }
};

const mapStateToProps = (state) => ({
  queryDate: getVisibleOption(state.visibilityOption),
  data: state.loadDataFromDB.data,
  loading: state.loadDataFromDB.loading,
  error: state.loadDataFromDB.error,
});

const mapDispatchToProps = {
  loadDataFromDB,
};

export default connect(mapStateToProps, mapDispatchToProps)(Table);
