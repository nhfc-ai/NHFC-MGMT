import * as React from 'react';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';

const Option = ({ active, children, onClick, variant }) => (
  <Button variant={variant} onClick={onClick} disabled={active}>
    {children}
  </Button>
);

Option.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string.isRequired,
};

export default Option;
