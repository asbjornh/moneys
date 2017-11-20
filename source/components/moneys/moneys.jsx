import React from "react";
import PropTypes from "prop-types";

import currencySymbols from "world-currencies";
import get from "lodash/get";

import css from "./moneys.module.scss";

import Graph from "../graph";
import Number from "../number";

class Moneys extends React.Component {
  static propTypes = {
    labels: PropTypes.object,
    lastUpdated: PropTypes.number,
    sum: PropTypes.number,
    userCurrency: PropTypes.string
  };

  static defaultProps = {
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
    const { userCurrency, lastUpdated, sum } = this.props;

    const symbol = get(currencySymbols, `${userCurrency}.units.major.symbol`);

    let time = lastUpdated && new Date(lastUpdated).toLocaleTimeString();
    time = time ? time.substr(0, 5) : "";

    const fontSize = `${1 - (String(parseInt(sum)).length - 2) * 0.05}em`;

    return (
      <div className={css.moneys} ref={div => (this.container = div)}>
        {this.state.graphSize && (
          <Graph labels={this.props.labels} {...this.state.graphSize} />
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

          <p>{`${this.props.labels.lastUpdatedLabel}: ${time}`}</p>
        </div>
      </div>
    );
  }
}

export default Moneys;
