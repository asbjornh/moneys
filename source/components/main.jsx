import React from "react";

import get from "lodash/get";
import yahooFinance from "yahoo-finance";

class Main extends React.Component {
  state = {
    stocks: []
  };

  componentDidMount() {
    try {
      const stocks = localStorage.getItem("stocks");
      this.setState({ stocks: stocks && JSON.parse(stocks) });
    } catch (e) {
      console.log("nope");
    }
  }

  onSubmit = e => {
    e.preventDefault();

    const formData = {};
    new FormData(e.target).forEach((value, key) => {
      formData[key] = value;
    });

    this.addStock(formData);

    console.log(formData);
  };

  addStock = ({ symbol, purchasePrice, qty }) => {
    yahooFinance.quote(
      {
        symbol: symbol.toUpperCase(),
        modules: ["price"]
      },
      (err, quotes) => {
        console.log(quotes);
        this.setState(
          state => {
            return {
              stocks: state.stocks.concat({
                currency: get(quotes, "price.currency"),
                longName: get(quotes, "price.longName").replace(/&amp;/g, "&"),
                symbol: get(quotes, "price.symbol"),
                price: get(quotes, "price.regularMarketPrice"),
                purchasePrice,
                qty
              })
            };
          },
          () => {
            try {
              localStorage.setItem("stocks", JSON.stringify(this.state.stocks));
            } catch (e) {
              console.log("nope");
            }
          }
        );
      }
    );
  };

  getDifference = ({ currency, price, purchasePrice, qty }) => {
    const absoluteDifference = ((price - purchasePrice) * qty).toFixed(2);
    const percentDifference = (price / purchasePrice * 100 - 100).toFixed(2);
    const symbol = absoluteDifference >= 0 ? "+" : "";
    return `${symbol}${absoluteDifference} ${currency}, ${symbol}${percentDifference}%`;
  };

  render() {
    return (
      <div>
        <h1>💸 Moneys</h1>
        <h2>Mine aksjer:</h2>

        <ul>
          {this.state.stocks.map((stock, index) => (
            <li key={stock.symbol + index}>
              <span>{`${stock.longName} (${stock.symbol}):`}</span>{" "}
              <span>{`${stock.price}, ${this.getDifference(stock)}`}</span>
            </li>
          ))}
        </ul>

        <form onSubmit={this.onSubmit}>
          <label>
            Ticker:<input name="symbol" placeholder="AAPL" />
          </label>
          <label>
            Pris:<input name="purchasePrice" placeholder="250" />
          </label>
          <label>
            Antall:<input name="qty" placeholder="1" />
          </label>
          <button type="submit">Legg til</button>
        </form>
      </div>
    );
  }
}

export default Main;
