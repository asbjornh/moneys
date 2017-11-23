import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";
import currencySymbols from "world-currencies";
import get from "lodash/get";

import css from "./realized-stock.module.scss";
import months from "../../data/months.json";
import utils from "../../js/utils";

import { UnmountClosed as Collapse } from "react-collapse";
import CircleX from "../icons/circle-x";
import Number from "../number";

class RealizedStock extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func,
    id: PropTypes.string,
    labels: PropTypes.object,
    purchasePrice: PropTypes.number,
    sellDate: PropTypes.number,
    sellPrice: PropTypes.number,
    symbol: PropTypes.string,
    userCurrency: PropTypes.string,
    qty: PropTypes.number
  };

  static propTypes = {
    onDelete: () => {}
  };

  state = {
    isExpanded: false
  };

  toggleContent = () => {
    this.setState(state => ({ isExpanded: !state.isExpanded }));
  };

  delete = () => {
    this.props.onDelete(this.props.id);
  };

  render() {
    const currencySymbol = get(
      currencySymbols,
      `${this.props.userCurrency}.units.major.symbol`
    );

    const sellDate = this.props.sellDate && new Date(this.props.sellDate);
    const { sellPrice, purchasePrice } = this.props;

    return (
      <tbody
        className={cn(css.realizedStock, {
          [css.isExpanded]: this.state.isExpanded
        })}
      >
        <tr>
          <td colSpan={3}>
            <div className={css.header} onClick={this.toggleContent}>
              <div className={css.symbol}>{this.props.symbol}</div>
              <div className={css.sum}>
                <Number
                  number={sellPrice - purchasePrice}
                  currencySymbol={currencySymbol}
                  currencySymbolIsSuperScript={false}
                />
              </div>
            </div>
            <Collapse isOpened={this.state.isExpanded}>
              <div className={css.content}>
                <div className={css.textContent}>
                  {sellDate && (
                    <p>
                      {`${
                        this.props.labels.dateLabel
                      }: ${sellDate.getDate()}. ${
                        months[sellDate.getMonth()]
                      } ${sellDate.getFullYear()}`}
                    </p>
                  )}
                  <p>
                    {`${utils.formatNumberWithSpaces(purchasePrice)} ${
                      currencySymbol
                    } → ${utils.formatNumberWithSpaces(sellPrice)} ${
                      currencySymbol
                    }`}
                    <span className={css.qty}>
                      {`${this.props.labels.qtyLabel}: ${this.props.qty}`}
                    </span>
                  </p>
                </div>
                <div className={css.buttonContainer}>
                  <button
                    type="button"
                    className={css.deleteButton}
                    onClick={this.delete}
                    title={this.props.labels.deleteLabel}
                  >
                    <CircleX />
                  </button>
                </div>
              </div>
            </Collapse>
          </td>
        </tr>
      </tbody>
    );
  }
}

export default RealizedStock;
