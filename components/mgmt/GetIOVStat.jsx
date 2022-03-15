import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

// import { getGithubReposApiMethod } from '../../lib/api/admin';
// import { styleTextField } from '../SharedStyles';
import notify from '../../lib/notify';

const propTypes = {
  onSave: PropTypes.func.isRequired,
};

function GetIOVStats(props) {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [state, setState] = React.useState({
    checkedMonitor: false,
    checkedER: false,
    checkedTransfer: false,
  });

  // const [checkedMonitor, setCheckedMonitor] = React.useState(true);
  // const [checkedER, setCheckedER] = React.useState(true);
  // const [checkedTransfer, setCheckedTransfer] = React.useState(true);

  // const handleChangeMonitor = (event) => {
  //   setCheckedMonitor(event.target.checkedMonitor);
  // };

  // const handleChangeER = (event) => {
  //   setCheckedER(event.target.checkedER);
  // };

  // const handleChangeTransfer = (event) => {
  //   setCheckedTransfer(event.target.checkedTranser);
  // };

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  const { checkedMonitor, checkedER, checkedTransfer } = state;

  return (
    <div style={{ padding: '10px 45px' }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // const { startDate, endDate } = this.state;
          //   console.log([startDate.toString(), endDate.toString()]);

          //   if (startDate.toString().length > 0) {
          //     console.log('haha');
          //     notify('Start Date is not required');
          //     return;
          //   }

          if (!startDate) {
            notify('Start Date is required');
            return;
          }

          if (!startDate.getTime() || startDate.getFullYear() < 2016) {
            notify('Please input valid Start Date');
            return;
          }

          if (!endDate) {
            notify('End Date is required');
            return;
          }

          if (!endDate.getTime()) {
            notify('Please input valid End Date');
            return;
          }

          // if ((endDate - startDate) / (1000 * 3600 * 24) < 27) {
          //   notify('Date Range Should Be Longer Than One Month');
          //   return;
          // }

          if (endDate <= startDate) {
            notify('Date Range Should Be Longer Than One Month');
            return;
          }

          props.onSave(startDate, endDate, checkedMonitor, checkedER, checkedTransfer);
        }}
      >
        <br />
        <div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newStartDate) => {
                setStartDate(newStartDate);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <br />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newEndDate) => {
                setEndDate(newEndDate);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkedMonitor}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="checkedMonitor"
                  />
                }
                label="Pull Full Monitor Appts?"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkedER}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="checkedER"
                  />
                }
                label="Pull Full ER Appts?"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkedTransfer}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                    name="checkedTransfer"
                  />
                }
                label="Pull Full Transfer Appts?"
              />
            </FormGroup>
          </LocalizationProvider>
        </div>
        <br />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
}

GetIOVStats.propTypes = propTypes;

export default GetIOVStats;
