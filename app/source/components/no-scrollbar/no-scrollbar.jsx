import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./no-scrollbar.module.scss";

class NoScrollbar extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ])
  };

  state = {
    isActive: true
  };

  componentDidMount() {
    const difference = this.wrapper.offsetWidth - this.wrapper.clientWidth;

    this.setState({
      isActive: difference > 0,
      wrapperWidth:
        difference && difference !== 0 ? `calc(100% + ${difference}px)` : ""
    });
  }

  render() {
    return (
      <div
        className={cn(css.wrapper, {
          [css.isActive]: this.state.isActive
        })}
      >
        <div
          className={css.wrapperInner}
          ref={div => (this.wrapper = div)}
          style={{ width: this.state.wrapperWidth }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default NoScrollbar;
