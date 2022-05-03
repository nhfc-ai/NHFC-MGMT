import * as React from 'react';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';

const StartOverOption = ({ startOver, children, onClick, color }) => (
  <Button variant="contained" color={color} onClick={onClick} disabled={startOver}>
    {children}
  </Button>
);

StartOverOption.propTypes = {
  startOver: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
};

export default StartOverOption;
