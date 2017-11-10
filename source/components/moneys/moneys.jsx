import React from "react";
import PropTypes from "prop-types";

import utils from "../../js/utils";

const Moneys = ({ stocks }) => {
  const moneys = stocks.map(stock => {
    return {
      amount: (stock.price - stock.purchasePrice) * stock.qty,
      currency: stock.currency
    };
  });

  utils.sumAndConvert(moneys).then(sum => {
    console.log(sum);
  });

  return <div className="" />;
};

Moneys.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      currency: PropTypes.string,
      purchasePrice: PropTypes.number,
      price: PropTypes.number,
      qty: PropTypes.number
    })
  )
};

export default Moneys;
