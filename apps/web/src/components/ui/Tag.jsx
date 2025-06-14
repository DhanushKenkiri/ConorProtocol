import React from 'react';
import PropTypes from 'prop-types';
import { StateColors, StateLabels } from '../../config/addresses';

/**
 * Tag component for displaying contract states
 */
const Tag = ({ state }) => {
  // Map state to corresponding color class and label
  const colorClass = StateColors[state] || 'secondary';
  const label = StateLabels[state] || 'Unknown';
  
  return (
    <span className={`tag tag-${colorClass}`}>
      {label}
    </span>
  );
};

Tag.propTypes = {
  state: PropTypes.number.isRequired,
};

export default Tag;
