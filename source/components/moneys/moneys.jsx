import React from "react";
import PropTypes from "prop-types";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import utils from "../../js/utils";

import css from "./moneys.module.scss";

import Number from "../number";

const Moneys = ({ currencies, convertToCurrency, lastUpdated, stocks }) => {
  let sum = 0;

  if (stocks && currencies) {
    sum = utils.sumAndConvert(stocks, currencies, convertToCurrency);
  }

  const symbol = get(
    currencySymbols,
    `${convertToCurrency}.units.major.symbol`
  );

  let time = lastUpdated && new Date(lastUpdated).toLocaleTimeString();
  time = time ? time.substr(0, 5) : "henter";

  return (
    <div className={css.moneys}>
      <h1>Moneys:</h1>
      <div className={css.number}>
        <Number number={sum} numberOfDecimals={0} currencySymbol={symbol} />
      </div>

      <p>{`Sist oppdatert: ${time}`}</p>
    </div>
  );
};

Moneys.propTypes = {
  currencies: PropTypes.object,
  convertToCurrency: PropTypes.string,
  lastUpdated: PropTypes.number,
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      currency: PropTypes.string,
      purchasePrice: PropTypes.number,
      price: PropTypes.number,
      qty: PropTypes.number
    })
  )
};

Moneys.defaultProps = {
  convertToCurrency: "NOK"
};

export default Moneys;
