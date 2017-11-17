import React from "react";
import PropTypes from "prop-types";

import css from "./select.module.scss";

class Select extends React.Component {
  static propTypes = {
    confirmationMessage: PropTypes.string,
    defaultValue: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    requireConfirmation: PropTypes.bool,
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
    if (
      this.props.requireConfirmation &&
      !confirm(this.props.confirmationMessage)
    ) {
      this.select.value = this.state.selectedValue;
    } else {
      const value = e.currentTarget.value;
      this.setState({ selectedValue: value });
      this.props.onChange(value);
    }
  };

  render() {
    return (
      <div className={css.select}>
        <label htmlFor="select">{`${this.props.label}: ${this.state
          .selectedValue}`}</label>
        <select
          defaultValue={this.props.defaultValue}
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
