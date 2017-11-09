import React from "react";
import PropTypes from "prop-types";

import FormData from "formdata-polyfill";

import css from "./form.module.scss";

class Form extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func
  };

  state = {};

  onSubmit = e => {
    e.preventDefault();

    const formData = {};
    Array.from(new FormData(e.target).entries()).forEach(value => {
      formData[value[0]] = value[1];
    });

    this.props.onSubmit(formData);
  };

  render() {
    return (
      <form className={css.form} onSubmit={this.onSubmit}>
        <div className={css.input}>
          <label>Ticker:</label>
          <input name="symbol" placeholder="AAPL" />
        </div>
        <div className={css.input}>
          <label>Pris:</label>
          <input name="purchasePrice" type="number" placeholder="250" />
        </div>
        <div className={css.input}>
          <label>Antall:</label>
          <input name="qty" type="number" placeholder="1" />
        </div>
        <button className={css.submitButton} type="submit">
          Legg til
        </button>
      </form>
    );
  }
}

export default Form;
