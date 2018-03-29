import React from "react";
import PropTypes from "prop-types";

import { Collapse } from "react-collapse";
import cn from "classnames";
import { Motion, spring } from "react-motion";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import css from "./moneys.module.scss";
import utils from "../../js/utils";

import Graph from "../graph";
import Number from "../number";

class Moneys extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    graphData: PropTypes.array,
    graphReady: PropTypes.bool,
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
    window.addEventListener("resize", this.setGraphSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setGraphSize);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sum !== this.props.sum && this.props.sum) {
      this.setGraphSize();
    }
  }

  setGraphSize = () => {
    this.setState({
      graphSize: {
        width: this.container.offsetWidth - this.textContainer.offsetWidth,
        height: this.textContainer.offsetHeight
      }
    });
  };

  onCollapseMeasure = ({ height }) => {
    // Hacky, but seems to work :P
    this.setState({}, () => {
      const title = this.titleEl;
      const description = this.descriptionEl;
      const newHeight =
        title &&
        description &&
        title.offsetHeight + description.offsetHeight + height;

      if (newHeight) {
        this.setState(state => ({
          graphSize: Object.assign({}, state.graphSize, {
            height: newHeight
          })
        }));
      }
    });
  };

  render() {
    const { userCurrency, sum } = this.props;

    const symbol = get(currencySymbols, `${userCurrency}.units.major.symbol`);

    const formattedSum = utils.formatNumber(sum.difference, true, 0);
    const fontSize = Math.min(1, 1 - (String(formattedSum).length - 4) * 0.15);

    return (
      <div
        className={cn(css.moneys, this.props.className)}
        ref={div => (this.container = div)}
      >
        {this.state.graphSize &&
          this.props.graphReady && (
            <Graph
              data={this.props.graphData}
              labels={this.props.labels}
              {...this.state.graphSize}
            />
          )}

        <div className={css.text} ref={div => (this.textContainer = div)}>
          <h1 ref={h1 => (this.titleEl = h1)}>Moneys:</h1>
          <Collapse isOpened={true} onMeasure={this.onCollapseMeasure}>
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
              <Motion
                defaultStyle={{ number: 0, scale: 1 }}
                style={{
                  number: spring(sum.difference, {
                    stiffness: 50,
                    damping: 15
                  }),
                  scale: spring(fontSize)
                }}
              >
                {({ scale, number }) => (
                  <div
                    className={css.visibleNumber}
                    style={{ transform: `scale(${scale})` }}
                  >
                    <Number
                      number={number}
                      numberOfDecimals={0}
                      currencySymbol={symbol}
                    />
                  </div>
                )}
              </Motion>
            </div>
          </Collapse>
          <div ref={div => (this.descriptionEl = div)}>
            <p>
              {`${this.props.labels.totalValueLabel}: `}
              <b>{`${utils.formatNumber(sum.total)} ${symbol}`}</b>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Moneys;
