import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";
import currencySymbols from "world-currencies";
import get from "lodash/get";
import { Motion, spring } from "react-motion";

import css from "./stock.module.scss";
import utils from "../../js/utils";

import Icons from "../icons";
import StaticContainer from "../static-container";
import StockResult from "./stock-result";

class Stock extends React.Component {
  static propTypes = {
    exchangeRates: PropTypes.object,
    currency: PropTypes.string,
    id: PropTypes.string.isRequired,
    isSorting: PropTypes.bool,
    labels: PropTypes.object,
    lastUpdated: PropTypes.number,
    longName: PropTypes.string,
    onDelete: PropTypes.func,
    onRealize: PropTypes.func,
    price: PropTypes.number,
    purchaseRate: PropTypes.number,
    purchasePrice: PropTypes.number,
    qty: PropTypes.number,
    shouldConvertCurrency: PropTypes.bool,
    symbol: PropTypes.string,
    type: PropTypes.string,
    userCurrency: PropTypes.string
  };

  static defaultProps = {
    price: 0,
    purchasePrice: 0,
    qty: 0,
    onDelete: () => {},
    onRealize: () => {}
  };

  state = {
    isAnimating: false,
    isSliding: false,
    slideProgress: 0,
    shouldConvertCurrency: this.props.shouldConvertCurrency
  };

  hasTouchStart = false;

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldConvertCurrency !== this.props.shouldConvertCurrency) {
      this.setState({ shouldConvertCurrency: nextProps.shouldConvertCurrency });
    }
  }

  onMouseEnter = () => {
    if (!this.hasTouchStart) {
      this.setState({
        isAnimating: true,
        isSliding: true,
        slideProgress: 1,
        springConfig: {}
      });
    }
  };

  onMouseLeave = () => {
    this.setState({ isAnimating: true, isSliding: false, slideProgress: 0 });
  };

  onClick = () => {
    if (!this.props.isSorting) {
      this.setState(state => ({
        shouldConvertCurrency: !state.shouldConvertCurrency
      }));
    }
  };

  onTouchStart = e => {
    this.hasTouchStart = true;

    if (!this.props.isSorting) {
      this.touchStartX = e.touches[0].clientX;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
      this.setState({ springConfig: { stiffness: 300, damping: 20 } });
    }
  };

  onTouchMove = e => {
    if (!this.props.isSorting) {
      const { clientX, clientY } = e.touches[0];

      if (
        Math.abs(clientX - this.lastTouchX) >
        Math.abs(clientY - this.lastTouchY)
      ) {
        e.preventDefault();

        const deltaX = (this.lastTouchX - clientX) / 90;

        this.setState(state => ({
          isAnimating: true,
          isSliding: true,
          slideProgress: utils.clamp(state.slideProgress + deltaX, 0, 1)
        }));
      }

      this.lastTouchX = clientX;
      this.lastTouchY = clientY;
    }
  };

  onTouchEnd = () => {
    setTimeout(() => {
      this.hasTouchStart = false;
    }, 20);

    if (!this.props.isSorting) {
      this.setState(state => ({
        isAnimating: state.slideProgress !== 0 && state.slideProgress !== 1,
        isSliding: state.slideProgress > 0.5,
        slideProgress: state.slideProgress > 0.5 ? 1 : 0
      }));
    }
  };

  onMotionRest = () => {
    this.setState({ isAnimating: false });
  };

  delete = () => {
    this.props.onDelete(this.props.id);
  };

  realize = () => {
    this.props.onRealize(this.props.id);
  };

  render() {
    const { currency, purchasePrice, price, qty, userCurrency } = this.props;

    const { slideProgress, springConfig } = this.state;

    const purchaseRate =
      currency !== userCurrency ? this.props.purchaseRate : purchasePrice / qty;

    const stockCurrencySymbol = get(
      currencySymbols,
      `${currency}.units.major.symbol`,
      ""
    );

    const isOutdated =
      this.props.type === "currency"
        ? utils.currencyIsOutdated(this.props.lastUpdated)
        : utils.stockIsOutdated(this.props.lastUpdated);

    const lastUpdatedText = this.props.lastUpdated
      ? new Date(this.props.lastUpdated).toLocaleString()
      : "";

    return (
      <Motion
        defaultStyle={{ x: 0, opacity: 0, scale: 0.4 }}
        onRest={this.onMotionRest}
        style={{
          x: spring(90 * slideProgress, springConfig),
          opacity: spring(slideProgress, springConfig),
          scale: spring(
            utils.rangeMap(slideProgress, 0, 1, 0.4, 1),
            springConfig
          )
        }}
      >
        {motion => (
          <div
            className={cn(css.stock, {
              [css.isSliding]: this.state.isSliding,
              [css.isSorting]: this.props.isSorting
            })}
            onClick={this.onClick}
            onTouchStart={this.onTouchStart}
            onTouchMove={this.onTouchMove}
            onTouchEnd={this.onTouchEnd}
            style={{ transform: `translateX(${-motion.x}px)` }}
          >
            <StaticContainer shouldUpdate={!this.state.isAnimating}>
              <div className={css.sortingHandle}>
                <Icons.DragHandle />
              </div>

              <div className={css.row}>
                <div className={css.ticker}>
                  {this.props.symbol}
                  {isOutdated && (
                    <span
                      className={css.warning}
                      title={`${
                        this.props.labels.isOutdated
                      } (${lastUpdatedText})`}
                    >
                      <Icons.Warning />
                    </span>
                  )}
                </div>

                <StockResult
                  exchangeRates={this.props.exchangeRates}
                  currency={this.props.currency}
                  purchasePrice={this.props.purchasePrice}
                  purchaseRate={this.props.purchaseRate}
                  price={this.props.price}
                  qty={this.props.qty}
                  shouldConvertCurrency={this.state.shouldConvertCurrency}
                  userCurrency={this.props.userCurrency}
                />
              </div>

              <div className={css.row}>
                <div className={css.longName}>{this.props.longName}</div>
                <div className={css.moreStuff}>
                  <span>
                    {(!purchaseRate
                      ? ""
                      : `${stockCurrencySymbol} ${utils.formatNumber(
                          purchaseRate
                        )} → `) +
                      `${stockCurrencySymbol} ${utils.formatNumber(price)}`}
                  </span>
                  <span>
                    {`${this.props.labels.qtyLabel}: ${utils.formatNumber(
                      qty
                    )}`}
                  </span>
                </div>
              </div>
            </StaticContainer>

            <div
              className={css.buttonContainer}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              style={{ transform: `translateX(${motion.x}px)` }}
            >
              <button
                className={css.realizeButton}
                onClick={this.realize}
                title={this.props.labels.realizeButton}
                type="button"
                style={{
                  opacity: motion.opacity,
                  transform: `scale(${motion.scale})`
                }}
              >
                <Icons.CircleDollar />
              </button>
              <button
                className={css.deleteButton}
                type="button"
                title={this.props.labels.deleteButton}
                onClick={this.delete}
                style={{
                  opacity: motion.opacity,
                  transform: `scale(${motion.scale})`
                }}
              >
                <Icons.CircleX />
              </button>
            </div>
          </div>
        )}
      </Motion>
    );
  }
}

export default Stock;
