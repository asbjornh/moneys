import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./switch.module.scss";

class Switch extends React.Component {
  static propTypes = {
    defaultValue: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func
  };

  static defaultProps = {
    onChange: () => {}
  };

  state = {
    isActive: this.props.defaultValue
  };

  onClick = () => {
    this.setState(
      state => ({ isActive: !state.isActive }),
      () => {
        this.props.onChange(this.state.isActive);
      }
    );
  };

  render() {
    return (
      <div className={css.switch} onClick={this.onClick}>
        <div className={css.label}>{`${this.props.label}:`}</div>
        <div
          className={cn(css.switchElement, {
            [css.isActive]: this.state.isActive
          })}
        >
          <div className={css.switchNub} />
        </div>
      </div>
    );
  }
}

export default Switch;
