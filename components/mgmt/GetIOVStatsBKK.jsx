import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

// import { getGithubReposApiMethod } from '../../lib/api/admin';
import { styleTextField } from '../SharedStyles';
import notify from '../../lib/notify';

const propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onSave: PropTypes.func.isRequired,
};

const defaultProps = {
  startDate: '',
  endDate: '',
};

function EndDatePicker(props) {
  const [endDate, setEndDate] = React.useState('');
  const { label } = props;
  console.log([label, endDate]);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={endDate}
        onChange={(newEndDate) => {
          setEndDate(newEndDate);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

function StartDatePicker(props) {
  const [startDate, setStartDate] = React.useState('');
  const { label } = props;
  console.log([label, startDate]);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={startDate}
        onChange={(newStartDate) => {
          setStartDate(newStartDate);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}

class GetIOVStats extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: props.startDate || '',
      endDate: props.endDate || '',
    };
  }

  onSubmit = (event) => {
    event.preventDefault();

    console.log(this.state);
    const { startDate, endDate } = this.state;
    console.log([startDate, endDate]);

    if (!startDate) {
      notify('Start Date is required');
      return;
    }

    if (!endDate) {
      notify('End Date is required');
      return;
    }

    this.props.onSave(this.state);
  };

  render() {
    return (
      <div style={{ padding: '10px 45px' }}>
        <form onSubmit={this.onSubmit}>
          <br />
          <div>
            <StartDatePicker label="Start Date" />
          </div>
          <br />
          <br />
          <div>
            <EndDatePicker label="End Date" />
          </div>
          <br />
          <br />
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </form>
      </div>
    );
  }
}

GetIOVStats.propTypes = propTypes;
GetIOVStats.defaultProps = defaultProps;

export default GetIOVStats;
