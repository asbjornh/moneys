import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./form.module.scss";

class Form extends React.Component {
  static propTypes = {
    labels: PropTypes.object,
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
      alert(this.props.labels.invalidForm);
    }
  };

  render() {
    const labels = this.props.labels;
    return (
      <form className={css.form} onSubmit={this.onSubmit} noValidate>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>{`${labels.tickerInput}:`}</label>
            <input name="symbol" placeholder="AAPL" />
          </div>
          <div className={css.input}>
            <label>{`${labels.qtyInput}:`}</label>
            <input name="qty" type="number" placeholder="1" />
          </div>
          <div className={css.input}>
            <label>{`${labels.purchasePriceInput} (${
              this.props.userCurrency
            }):`}</label>
            <input name="purchasePrice" type="number" placeholder="1000" />
          </div>
        </div>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>{`${labels.purchaseRateInput}:`}</label>
            <input name="purchaseRate" type="number" placeholder="100" />
          </div>
          <div className={css.input}>
            <label>{`${labels.purchaseDateInput}:`}</label>
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
        <p>{labels.rateOrDateHelpText}</p>
        <button
          className={css.cancelButton}
          type="button"
          onClick={this.props.onCancelClick}
        >
          {labels.cancelButton}
        </button>
        <button className={css.submitButton} type="submit">
          {labels.addButton}
        </button>
      </form>
    );
  }
}

export default Form;
