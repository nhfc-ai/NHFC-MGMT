import React from 'react';
import { connect } from 'react-redux';
import Stack from '@mui/material/Stack';
import GetOption from './GetOption';
import GetStartOverOption from './GetStartOverOption';
import { VisibilityOptions, VisibilityStartOverOptions } from '../actions';

const Console = () => {
  return (
    <div>
      <Stack direction="row" spacing={4}>
        <GetOption option={VisibilityOptions.Today} variant="outlined">
          Today
        </GetOption>
        <GetOption option={VisibilityOptions.Tomorrow} variant="contained">
          Tomorrow
        </GetOption>
        <GetOption option={VisibilityOptions.Overmorrow} variant="outlined">
          Overmorrow
        </GetOption>
        <GetStartOverOption option={VisibilityStartOverOptions.START_OVER} color="secondary">
          Start Over
        </GetStartOverOption>
      </Stack>
    </div>
  );
};

export default connect()(Console);
