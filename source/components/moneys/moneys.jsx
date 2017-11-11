import React from "react";
import PropTypes from "prop-types";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import css from "./moneys.module.scss";

import Graph from "../graph";
import Number from "../number";

class Moneys extends React.Component {
  static propTypes = {
    convertToCurrency: PropTypes.string,
    lastUpdated: PropTypes.number,
    sum: PropTypes.number
  };

  static defaultProps = {
    convertToCurrency: "NOK"
  };

  state = {};

  componentDidUpdate(prevProps) {
    if (prevProps.sum !== this.props.sum && this.props.sum) {
      console.log("update", this.props.sum);
      this.setState({
        graphWidth: this.container.offsetWidth - this.textContainer.offsetWidth
      });
    }
  }

  render() {
    const { convertToCurrency, lastUpdated, sum } = this.props;

    const symbol = get(
      currencySymbols,
      `${convertToCurrency}.units.major.symbol`
    );

    let time = lastUpdated && new Date(lastUpdated).toLocaleTimeString();
    time = time ? time.substr(0, 5) : "";

    const fontSize = `${1 - (String(parseInt(sum)).length - 2) * 0.05}em`;

    return (
      <div className={css.moneys} ref={div => (this.container = div)}>
        {this.state.graphWidth && (
          <div style={{ width: this.state.width }}>
            <Graph width={this.state.graphWidth} />
          </div>
        )}
        <div className={css.text} ref={div => (this.textContainer = div)}>
          <h1>Moneys:</h1>
          <div className={css.number}>
            <div style={{ fontSize }}>
              <Number
                number={sum}
                numberOfDecimals={0}
                currencySymbol={symbol}
              />
            </div>
          </div>

          <p>{`Sist oppdatert: ${time}`}</p>
        </div>
      </div>
    );
  }
}

export default Moneys;
