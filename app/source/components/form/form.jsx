import React from "react";
import PropTypes from "prop-types";

import Select from "../select";

import css from "./form.module.scss";
import settings from "../../../settings";

class Form extends React.Component {
  static propTypes = {
    labels: PropTypes.object,
    onCancelClick: PropTypes.func,
    onSubmit: PropTypes.func,
    supportedCurrencies: PropTypes.array,
    userCurrency: PropTypes.string
  };

  state = {
    investmentType: "stock"
  };

  onSubmit = e => {
    e.preventDefault();

    const formData = {};

    Array.from(new FormData(e.target).entries()).forEach(value => {
      formData[value[0]] = value[1].toUpperCase();
    });

    const { symbol, qty, purchasePrice } = formData;
    let formIsValid = true;

    if (!symbol || !qty || !purchasePrice) {
      formIsValid = false;
    }

    if (formIsValid) {
      this.props.onSubmit(formData);
    } else {
      alert(this.props.labels.invalidForm);
    }
  };

  toggleInvestmentType = type => {
    this.setState({ investmentType: type });
  };

  render() {
    const labels = this.props.labels;
    const exchangeRates = [
      { value: "", label: labels.intermediateCurrencyDefault }
    ].concat(
      settings.intermediateCurrencies
        .filter(currency => currency !== this.props.userCurrency)
        .map(currency => ({ value: currency, label: currency }))
    );

    return (
      <form className={css.form} onSubmit={this.onSubmit} noValidate>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>{labels.typeInput}</label>
            <Select
              name="type"
              onChange={this.toggleInvestmentType}
              values={[
                { value: "stock", label: labels.typeInputStock },
                { value: "currency", label: labels.typeInputCurrency }
              ]}
            />
          </div>
          <div className={css.input}>
            {this.state.investmentType === "currency" && [
              <label key="label">{labels.intermediateCurrencyInput}</label>,
              <Select
                name="intermediateCurrency"
                key="select"
                values={exchangeRates}
              />
            ]}
          </div>
        </div>
        <div className={css.formRow}>
          <div className={css.input}>
            {this.state.investmentType === "currency"
              ? [
                  <label key="label">{`${labels.currencyInput} *`}</label>,
                  <Select
                    name="symbol"
                    key="input"
                    values={this.props.supportedCurrencies}
                  />
                ]
              : [
                  <label key="label">{`${labels.tickerInput} *`}</label>,
                  <input name="symbol" placeholder="AAPL" key="input" />
                ]}
          </div>
          <div className={css.input}>
            <label>{`${labels.qtyInput} *`}</label>
            <input name="qty" type="number" placeholder="1" />
          </div>
        </div>
        <div className={css.formRow}>
          <div className={css.input}>
            <label>{`${labels.purchasePriceInput} (${
              this.props.userCurrency
            }) *`}</label>
            <input name="purchasePrice" type="number" placeholder="1000" />
          </div>
          <div className={css.input}>
            <label>{labels.purchaseRateInput}</label>
            <input name="purchaseRate" type="number" placeholder="100" />
          </div>
        </div>
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
