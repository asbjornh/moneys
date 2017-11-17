import React from "react";
import PropTypes from "prop-types";

import css from "./select.module.scss";

class Select extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    onChange: PropTypes.func,
    values: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  static defaultProps = {
    onChange: () => {}
  };

  state = {};

  componentDidMount() {
    this.setState({ selectedValue: this.select.value });
  }

  onChange = e => {
    const value = e.currentTarget.value;
    this.setState({ selectedValue: value });
    this.props.onChange(value);
  };

  render() {
    return (
      <div className={css.select}>
        <label htmlFor="select">{`${this.props.label}: ${this.state
          .selectedValue}`}</label>
        <select
          id="select"
          onChange={this.onChange}
          ref={s => (this.select = s)}
        >
          {this.props.values.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default Select;
