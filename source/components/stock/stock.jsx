import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./stock.module.scss";

class Stock extends React.Component {
  static propTypes = {
    currency: PropTypes.string,
    longName: PropTypes.string,
    price: PropTypes.number,
    purchasePrice: PropTypes.number,
    qty: PropTypes.number,
    symbol: PropTypes.string
  };

  state = {};

  render() {
    const { currency, price, purchasePrice, qty } = this.props;
    const absoluteDifference = ((price - purchasePrice) * qty).toFixed(2);
    const relativeDifference = (price / purchasePrice * 100 - 100).toFixed(2);
    const symbol = absoluteDifference >= 0 ? "+" : "";
    const isPositive = absoluteDifference >= 0;

    return (
      <tbody>
        <tr className={css.firstRow}>
          <td>
            <div className={css.description}>
              <div className={css.ticker}>{this.props.symbol}</div>
            </div>
          </td>
          <td
            className={cn(
              css.percentage,
              isPositive ? css.isPositive : css.isNegative
            )}
          >
            {`${symbol}${relativeDifference}%`}
          </td>
          <td
            className={cn(
              css.moneys,
              isPositive ? css.isPositive : css.isNegative
            )}
          >
            {`${symbol}${absoluteDifference}`}
            <span className={css.currency}>{this.props.currency}</span>
          </td>
        </tr>
        <tr className={css.lastRow}>
          <td>
            <div className={css.longName}>{this.props.longName}</div>
          </td>
          <td colSpan={2} className={css.moreStuff}>
            <span>{`${currency} ${purchasePrice} → ${currency} ${price.toFixed(
              2
            )}`}</span>
            <span>{`Ant.: ${qty}`}</span>
          </td>
        </tr>
      </tbody>
    );
  }
}

export default Stock;
