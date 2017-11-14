import React from "react";
import PropTypes from "prop-types";

import FormData from "formdata-polyfill";

import css from "./form.module.scss";

class Form extends React.Component {
  static propTypes = {
    onCancelClick: PropTypes.func,
    onSubmit: PropTypes.func
  };

  state = {};

  onSubmit = e => {
    e.preventDefault();

    const formData = {};
    let formIsValid = true;

    Array.from(new FormData(e.target).entries()).forEach(value => {
      formData[value[0]] = value[1].toUpperCase();
      if (!value[1]) formIsValid = false;
    });

    if (formIsValid) {
      this.props.onSubmit(formData);
    } else {
      alert("Fyll ut alle feltene");
    }
  };

  render() {
    return (
      <form className={css.form} onSubmit={this.onSubmit} noValidate>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>Ticker:</label>
            <input name="symbol" placeholder="AAPL" />
          </div>
          <div className={css.input}>
            <label>Antall:</label>
            <input name="qty" type="number" placeholder="1" />
          </div>
          <div className={css.input}>
            <label>Totalpris:</label>
            <input name="purchasePrice" type="number" placeholder="1000" />
          </div>
        </div>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>Valuta:</label>
            <input name="purchaseCurrency" type="text" placeholder="NOK" />
          </div>
          <div className={css.input}>
            <label>Dato kjøpt:</label>
            <input name="purchaseDate" type="date" />
          </div>
        </div>
        <button
          className={css.cancelButton}
          type="button"
          onClick={this.props.onCancelClick}
        >
          Avbryt
        </button>
        <button className={css.submitButton} type="submit">
          Legg til
        </button>
      </form>
    );
  }
}

export default Form;
