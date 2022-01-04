import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

// import { getGithubReposApiMethod } from '../../lib/api/admin';
// import { styleTextField } from '../SharedStyles';
import notify from '../../lib/notify';

const propTypes = {
  onSave: PropTypes.func.isRequired,
};

function GetIOVCalendly(props) {
  const [date, setDate] = React.useState(null);

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

          if (!date) {
            notify('Date is required');
            return;
          }

          if (
            !date.getTime() ||
            date.getFullYear() < 2021 ||
            (date.getFullYear() === 2021 && date.getMonth() < 11)
          ) {
            notify('Please input valid Start Date');
            return;
          }

          props.onSave(date);
        }}
      >
        <br />
        <div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Year and Month"
              minDate={new Date('2021-12-31')}
              maxDate={new Date()}
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
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

GetIOVCalendly.propTypes = propTypes;

export default GetIOVCalendly;
