import React from "react";
import PropTypes from "prop-types";

import { Motion, spring } from "react-motion";
import TinyTransition from "react-tiny-transition";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import css from "./moneys.module.scss";
import utils from "../../js/utils";

import Graph from "../graph";
import Number from "../number";

class Moneys extends React.Component {
  static propTypes = {
    graphData: PropTypes.array,
    labels: PropTypes.object,
    sum: PropTypes.shape({
      total: PropTypes.number,
      difference: PropTypes.number
    }),
    userCurrency: PropTypes.string
  };

  static defaultProps = {
    sum: {
      difference: 0,
      total: 0
    },
    userCurrency: "NOK"
  };

  state = {};

  componentDidMount() {
    window.addEventListener("resize", this.getGraphSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.getGraphSize);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sum !== this.props.sum && this.props.sum) {
      this.getGraphSize();
    }
  }

  getGraphSize = () => {
    this.setState({
      graphSize: {
        width: this.container.offsetWidth - this.textContainer.offsetWidth,
        height: this.textContainer.offsetHeight
      }
    });
  };

  render() {
    const { userCurrency, sum } = this.props;

    const symbol = get(currencySymbols, `${userCurrency}.units.major.symbol`);

    const formattedSum = utils.formatNumber(sum.difference, true, 0);
    const fontSize = Math.min(1, 1 - (String(formattedSum).length - 4) * 0.1);

    return (
      <div className={css.moneys} ref={div => (this.container = div)}>
        <TinyTransition
          duration={1000}
          classNames={{
            beforeEnter: css.graphBeforeEnter,
            entering: css.graphEntering,
            beforeLeave: css.graphBeforeLeave,
            leaving: css.graphBeforeLeave
          }}
        >
          {this.state.graphSize && (
            <Graph
              data={this.props.graphData}
              labels={this.props.labels}
              {...this.state.graphSize}
            />
          )}
        </TinyTransition>
        <div className={css.text} ref={div => (this.textContainer = div)}>
          <h1>Moneys:</h1>
          <div className={css.number}>
            <div
              className={css.numberSpacer}
              style={{ fontSize: `${fontSize}em` }}
            >
              <Number
                number={sum.difference}
                numberOfDecimals={0}
                currencySymbol={symbol}
              />
            </div>
            <div className={css.visibleNumber}>
              <Motion
                defaultStyle={{ number: 0, fontSize: 1 }}
                style={{
                  number: spring(sum.difference, {
                    stiffness: 50,
                    damping: 15
                  }),
                  fontSize: spring(fontSize)
                }}
              >
                {({ number }) => (
                  <div style={{ fontSize: `${fontSize}em` }}>
                    <Number
                      number={number}
                      numberOfDecimals={0}
                      currencySymbol={symbol}
                    />
                  </div>
                )}
              </Motion>
            </div>
          </div>
          <p>
            {`${this.props.labels.totalValueLabel}: `}
            <b>{`${utils.formatNumber(sum.total)} ${symbol}`}</b>
          </p>
        </div>
      </div>
    );
  }
}

export default Moneys;
