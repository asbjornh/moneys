import React from "react";
import PropTypes from "prop-types";

import css from "./spinner.module.scss";

class Spinner extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    type: PropTypes.string
  };

  static defaultProps = {
    type: "div"
  };
  render() {
    return React.createElement(
      this.props.type,
      {},
      this.props.children([
        <div className={css.spinner} key="spinner">
          <div key="spinner" className={css.spinnerInner} />
        </div>,
        <div className={css.spacer} key="spacer" />
      ])
    );
  }
}

export default Spinner;
