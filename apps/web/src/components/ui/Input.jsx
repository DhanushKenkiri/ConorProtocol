import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Custom Input component with retro terminal styling
 */
const Input = ({ className = '', ...props }) => {
  return (
    <Form.Control
      className={`form-control-retro ${className}`}
      {...props}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;
