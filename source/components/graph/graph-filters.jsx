import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./graph.module.scss";

const GraphFilters = ({ daysToShow, labels, onUpdate }) => {
  const filters = [
    {
      value: 7,
      label: labels.weekLabel
    },
    {
      value: 31,
      label: labels.monthLabel
    },
    {
      value: 365,
      label: labels.yearLabel
    },
    {
      value: null,
      label: labels.maxLabel
    }
  ];

  return (
    <ul className={css.filters}>
      {filters.map(item => (
        <li key={item.value}>
          <button
            type="button"
            className={cn({
              [css.isActive]: daysToShow === item.value
            })}
            onClick={() => onUpdate(item.value)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

GraphFilters.propTypes = {
  daysToShow: PropTypes.number,
  labels: PropTypes.object,
  onUpdate: PropTypes.func
};

export default GraphFilters;
