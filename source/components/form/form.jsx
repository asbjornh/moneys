import React from "react";
import PropTypes from "prop-types";

import css from "./form.module.scss";

class Form extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func
  };

  state = {};

  onSubmit = e => {
    e.preventDefault();

    const formData = {};
    new FormData(e.target).forEach((value, key) => {
      formData[key] = value;
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
