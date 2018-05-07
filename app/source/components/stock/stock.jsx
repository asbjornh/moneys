import React from "react";
import PropTypes from "prop-types";

import { Animated, Text, View } from "react-native";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import s from "./stock.styles";
import utils from "../../js/utils";

import Button from "../button";
import Icons from "../icons";
import StaticContainer from "../static-container";
import StockResult from "./stock-result";
import SwipeWrapper from "../swipe-wrapper";

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
    shouldConvertCurrency: this.props.shouldConvertCurrency
  };

  componentDidUpdate(prevProps) {
    if (prevProps.shouldConvertCurrency !== this.props.shouldConvertCurrency) {
      this.setState({
        shouldConvertCurrency: this.props.shouldConvertCurrency
      });
    }
  }

  onClick = () => {
    if (!this.props.isSorting) {
      this.setState(state => ({
        shouldConvertCurrency: !state.shouldConvertCurrency
      }));
    }
  };

  delete = () => {
    this.props.onDelete(this.props.id);
  };

  realize = () => {
    this.props.onRealize(this.props.id);
  };

  render() {
    const { currency, purchasePrice, price, qty, userCurrency } = this.props;

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
      <SwipeWrapper maxDistance={90} isEnabled={!this.props.isSorting}>
        {({ isAnimating, slideProgress }) => (
          <React.Fragment>
            <Animated.View
              style={[
                s.stock,
                {
                  transform: [
                    {
                      translateX: slideProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -90]
                      })
                    }
                  ]
                }
              ]}
            >
              <StaticContainer shouldUpdate={!isAnimating}>
                <View
                  style={[s.sortingHandle].concat(
                    this.props.isSorting
                      ? {
                          opacity: 1,
                          transform: []
                        }
                      : []
                  )}
                >
                  <Icons.DragHandle />
                </View>

                <View style={s.row}>
                  <Text style={s.ticker}>
                    {this.props.symbol}
                    {isOutdated && (
                      <View
                        style={s.warning}
                        title={`${
                          this.props.labels.isOutdated
                        } (${lastUpdatedText})`}
                      >
                        <Icons.Warning />
                      </View>
                    )}
                  </Text>

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
                </View>

                <View style={s.row}>
                  <Text style={s.longName}>{this.props.longName}</Text>
                  <View style={s.moreStuff}>
                    <Text style={s.moreStuffChild}>
                      {(!purchaseRate
                        ? ""
                        : `${stockCurrencySymbol} ${utils.formatNumber(
                            purchaseRate
                          )} → `) +
                        `${stockCurrencySymbol} ${utils.formatNumber(price)}`}
                    </Text>
                    <Text style={s.moreStuffChild} numberOfLines={1}>
                      {`${this.props.labels.qtyLabel}: ${utils.formatNumber(
                        qty
                      )}`}
                    </Text>
                  </View>
                </View>
              </StaticContainer>
            </Animated.View>

            <View
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              style={s.buttonContainer}
            >
              <Animated.View
                style={{
                  flex: 0,
                  alignSelf: "flex-start",
                  opacity: slideProgress,
                  transform: [{ scale: slideProgress }]
                }}
              >
                <Button
                  title={this.props.labels.realizeButton}
                  onClick={() => {
                    // console.log("clicky");
                  }}
                >
                  <Icons.CircleDollar />
                </Button>
              </Animated.View>

              <Animated.View
                style={{
                  flex: 0,
                  alignSelf: "flex-start",
                  opacity: slideProgress,
                  transform: [{ scale: slideProgress }]
                }}
              >
                <Button
                  title={this.props.labels.deleteButton}
                  onClick={() => {
                    // console.log("clicky");
                  }}
                >
                  <Icons.CircleX />
                </Button>
              </Animated.View>
            </View>
          </React.Fragment>
        )}
      </SwipeWrapper>
    );
  }
}

export default Stock;
