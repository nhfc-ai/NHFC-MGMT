import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
    const { startDate, endDate } = this.state;

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
            <TextField
              onChange={(event) => {
                this.setState({
                  // eslint-disable-next-line
                  startDate: event.target.value,
                });
              }}
              value={this.state.startDate}
              type="text"
              label="Start Date"
              style={styleTextField}
            />
          </div>
          <br />
          <br />
          <TextField
            onChange={(event) => {
              this.setState({
                // eslint-disable-next-line
                endDate: event.target.value,
              });
            }}
            value={this.state.endDate}
            type="text"
            label="End Date"
            className="textFieldInput"
            style={styleTextField}
          />
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
