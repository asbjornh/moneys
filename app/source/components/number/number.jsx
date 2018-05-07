import React from "react";
import PropTypes from "prop-types";

import { Text, View } from "react-native";

import s from "./number.style";
import utils from "../../js/utils";
import { fontSize } from "../../styles/vars";

const Number = ({
  currencySymbol,
  currencySymbolIsSuperScript,
  fontSize,
  number,
  numberOfDecimals
}) => {
  const parsedNumber = parseFloat(number);

  return (
    <View style={s.wrapper}>
      <Text style={s.number(fontSize, parsedNumber)}>
        {utils.formatNumber(parsedNumber, true, numberOfDecimals)}
      </Text>
      <Text
        style={[
          s.number(fontSize, parsedNumber),
          s.symbol(fontSize, currencySymbolIsSuperScript)
        ]}
      >
        {currencySymbol}
      </Text>
    </View>
  );
};

Number.propTypes = {
  currencySymbol: PropTypes.string,
  currencySymbolIsSuperScript: PropTypes.bool,
  fontSize: PropTypes.number,
  number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  numberOfDecimals: PropTypes.number
};

Number.defaultProps = {
  currencySymbolIsSuperScript: true,
  fontSize: fontSize,
  number: 0
};

export default Number;
