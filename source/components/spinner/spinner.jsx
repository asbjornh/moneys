import React from "react";
import PropTypes from "prop-types";

import css from "./spinner.module.scss";

import TinyTransition from "react-tiny-transition";

const Spinner = ({ isLoading }) => (
  <TinyTransition
    duration={500}
    classNames={{
      beforeEnter: css.beforeEnter,
      entering: css.entering,
      beforeLeave: css.beforeLeave,
      leaving: css.leaving
    }}
  >
    {isLoading && (
      <div className={css.spinner} key="spinner">
        <div key="spinner" className={css.spinnerInner} />
      </div>
    )}
  </TinyTransition>
);

Spinner.propTypes = {
  isLoading: PropTypes.bool
};

export default Spinner;
