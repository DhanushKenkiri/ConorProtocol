import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Custom Button component with retro terminal styling
 */
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  // Map Bootstrap variants to our retro variants if needed
  const getVariantClass = () => {
    return `btn-retro ${variant === 'primary' ? 'btn-retro-primary' : ''}`;
  };

  return (
    <BootstrapButton
      className={`${getVariantClass()} ${className}`}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
