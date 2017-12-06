import React from "react";
import PropTypes from "prop-types";

import css from "./select.module.scss";

class Select extends React.Component {
  static propTypes = {
    confirmationMessage: PropTypes.string,
    defaultValue: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    requireConfirmation: PropTypes.bool,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string
      })
    ).isRequired
  };

  static defaultProps = {
    onChange: () => {}
  };

  state = {};

  componentDidMount() {
    this.setState({
      selectedValue: this.select.value,
      selectedLabel: this.getLabel(this.select.value)
    });
  }

  getLabel = value => {
    return this.props.values.reduce((accum, item) => {
      if (item.value === value) {
        return item.label;
      } else {
        return accum;
      }
    }, "");
  };

  onChange = e => {
    if (
      this.props.requireConfirmation &&
      !confirm(this.props.confirmationMessage)
    ) {
      this.select.value = this.state.selectedValue;
    } else {
      const value = e.currentTarget.value;
      this.setState({
        selectedValue: value,
        selectedLabel: this.getLabel(value)
      });
      this.props.onChange(value);
    }
  };

  render() {
    const label = this.props.label ? `${this.props.label}:` : "";
    return (
      <div className={css.select}>
        <label htmlFor="select">{`${label} ${this.state.selectedLabel}`}</label>
        <select
          defaultValue={this.props.defaultValue}
          id="select"
          name={this.props.name}
          onChange={this.onChange}
          ref={s => (this.select = s)}
        >
          {this.props.values.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default Select;
