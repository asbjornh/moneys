import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";
import FormData from "formdata-polyfill";

import css from "./form.module.scss";

class Form extends React.Component {
  static propTypes = {
    onCancelClick: PropTypes.func,
    onSubmit: PropTypes.func,
    userCurrency: PropTypes.string
  };

  state = {
    dateInputHasContent: false
  };

  onDateInput = () => {
    this.setState({ dateInputHasContent: true });
  };

  onSubmit = e => {
    e.preventDefault();

    const formData = {};

    Array.from(new FormData(e.target).entries()).forEach(value => {
      formData[value[0]] = value[1].toUpperCase();
    });

    const { symbol, qty, purchasePrice, purchaseRate, purchaseDate } = formData;
    let formIsValid = true;

    if (!symbol || !qty || !purchasePrice || (!purchaseRate && !purchaseDate)) {
      formIsValid = false;
    }

    if (formIsValid) {
      this.props.onSubmit(formData);
    } else {
      alert("Fyll inn alle påkrevde felter");
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
            <label>{`Totalpris (${this.props.userCurrency}):`}</label>
            <input name="purchasePrice" type="number" placeholder="1000" />
          </div>
        </div>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>Kurs ved kjøp:</label>
            <input name="purchaseRate" type="text" placeholder="100" />
          </div>
          <div className={css.input}>
            <label>Dato kjøpt:</label>
            <input
              className={cn({
                [css.hasContent]: this.state.dateInputHasContent
              })}
              name="purchaseDate"
              type="date"
              onKeyPress={this.onDateInput}
              onChange={this.onDateInput}
            />
          </div>
        </div>
        <p>
          Fyll inn kjøpskurs hvis du vet den, dato hvis du ikke vet den (mindre
          presis kurs-differanse).
        </p>
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
