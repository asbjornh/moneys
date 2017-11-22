import React from "react";
import PropTypes from "prop-types";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import css from "./realized-stock.module.scss";
import months from "../../data/months.json";
import Number from "../number";

class RealizedStock extends React.Component {
  static propTypes = {
    labels: PropTypes.object,
    longName: PropTypes.string,
    purchasePrice: PropTypes.number,
    sellDate: PropTypes.number,
    sellPrice: PropTypes.number,
    symbol: PropTypes.string,
    userCurrency: PropTypes.string
  };

  state = {};

  render() {
    const currencySymbol = get(
      currencySymbols,
      `${this.props.userCurrency}.units.major.symbol`
    );

    const sellDate = this.props.sellDate && new Date(this.props.sellDate);

    return (
      <tbody className={css.realizedStock}>
        <tr className={css.firstRow}>
          <td colSpan={2} className={css.symbol}>
            {this.props.symbol}
          </td>
          <td className={css.sum}>
            <Number
              number={this.props.sellPrice - this.props.purchasePrice}
              currencySymbol={currencySymbol}
              currencySymbolIsSuperScript={false}
            />
          </td>
        </tr>
        <tr className={css.lastRow}>
          <td>{this.props.longName}</td>
          {sellDate && (
            <td className={css.date} colSpan={2}>
              {`${this.props.labels.dateLabel}: ${sellDate.getDate()}. ${months[
                sellDate.getMonth()
              ]} ${sellDate.getFullYear()}`}
            </td>
          )}
        </tr>
      </tbody>
    );
  }
}

export default RealizedStock;
