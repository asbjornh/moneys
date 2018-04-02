/* eslint-disable react/prefer-stateless-function */
// PureComponent is used to fix some glitchy rendering
import React from "react";
import PropTypes from "prop-types";

import css from "./spinner.module.scss";

import TinyTransition from "react-tiny-transition";

class Spinner extends React.PureComponent {
  static propTypes = {
    isLoading: PropTypes.bool
  };

  render() {
    return (
      <TinyTransition
        duration={500}
        classNames={{
          beforeEnter: css.beforeEnter,
          entering: css.entering,
          beforeLeave: css.beforeLeave,
          leaving: css.leaving
        }}
      >
        {this.props.isLoading && (
          <div className={css.spinner} key="spinner">
            <div key="spinner" className={css.spinnerInner} />
          </div>
        )}
      </TinyTransition>
    );
  }
}

export default Spinner;
