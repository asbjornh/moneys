import React from "react";
import PropTypes from "prop-types";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import utils from "../../js/utils";

import css from "./moneys.module.scss";

import Number from "../number";

const Moneys = ({ currencies, convertToCurrency, stocks }) => {
  let sum = 0;

  if (stocks && currencies) {
    const moneys =
      stocks.map(stock => {
        return {
          amount: (stock.price - stock.purchasePrice) * stock.qty,
          currency: stock.currency
        };
      }) || 0;

    sum = utils.sumAndConvert(moneys, currencies, convertToCurrency);
  }

  const symbol = get(
    currencySymbols,
    `${convertToCurrency}.units.major.symbol`
  );

  return (
    <div className={css.moneys}>
      <h1>Moneys:</h1>
      <div className={css.number}>
        <Number number={sum} numberOfDecimals={0} currencySymbol={symbol} />
      </div>
    </div>
  );
};

Moneys.propTypes = {
  currencies: PropTypes.object,
  convertToCurrency: PropTypes.string,
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
