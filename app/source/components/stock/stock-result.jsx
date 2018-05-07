import React from "react";
import PropTypes from "prop-types";

import { View } from "react-native";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import s from "./stock.styles";
import utils from "../../js/utils";
import { fontSizeLg } from "../../styles/vars";

import Number from "../number";

const StockResult = ({
  exchangeRates,
  currency,
  purchasePrice,
  purchaseRate,
  price,
  qty,
  shouldConvertCurrency,
  userCurrency
}) => {
  const convertCurrency =
    !purchaseRate || (shouldConvertCurrency && currency !== userCurrency);

  const convertedPrice = utils.convert(
    price,
    currency,
    userCurrency,
    exchangeRates
  );

  const absoluteDifference = convertCurrency
    ? convertedPrice * qty - purchasePrice
    : (price - purchaseRate) * qty;

  const relativeDifference = convertCurrency
    ? convertedPrice * qty / purchasePrice * 100 - 100
    : price / purchaseRate * 100 - 100;

  const currencySymbol = get(
    currencySymbols,
    `${convertCurrency ? userCurrency : currency}.units.major.symbol`,
    ""
  );

  return (
    <React.Fragment>
      <View style={s.percentage}>
        <Number
          number={relativeDifference}
          currencySymbol="%"
          currencySymbolIsSuperScript={false}
        />
      </View>

      <View style={s.number}>
        <Number
          fontSize={fontSizeLg}
          number={absoluteDifference}
          currencySymbol={currencySymbol}
        />
      </View>
    </React.Fragment>
  );
};

StockResult.propTypes = {
  exchangeRates: PropTypes.object,
  currency: PropTypes.string,
  purchasePrice: PropTypes.number,
  purchaseRate: PropTypes.number,
  price: PropTypes.number,
  qty: PropTypes.number,
  shouldConvertCurrency: PropTypes.bool,
  userCurrency: PropTypes.string
};

export default StockResult;
