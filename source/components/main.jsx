import React from "react";

import cn from "classnames";
import { UnmountClosed as Collapse } from "react-collapse";
import FlipMove from "react-flip-move";

import api from "../js/api-helper";
import settings from "../settings.json";
import utils from "../js/utils";

import Form from "./form";
import Header from "./header";
import Menu from "./menu";
import Moneys from "./moneys";
import Spinner from "./spinner";
import Stock from "./stock";

class Main extends React.Component {
  state = {
    formIsVisible: false,
    isLoading: api.hasStoredStocks(),
    stocks: []
  };

  componentDidMount() {
    this.refreshData();
  }

  componentWillUnmount() {
    clearInterval(this.updateLoop);
  }

  refreshData = () => {
    this.updateLoop = setTimeout(this.refreshData, settings.updateInterval);
    console.log("updating");
    this.setState({ isLoading: true }, () => {
      api
        .getStocks()
        .then(({ stocks, lastUpdated }) => {
          this.setState({ isLoading: false, stocks, lastUpdated });

          api.getCurrencies().then(currencies => {
            this.setState({
              currencies,
              sum: utils.sumAndConvert(stocks, currencies, "NOK")
            });
          });
        })
        .catch(e => {
          this.setState({ isLoading: false });
          console.log(e);
        });
    });
  };

  addStock = formData => {
    this.setState({ formIsVisible: false, isLoading: true }, () => {
      // Delay api call because flipMove doesn't do interrupts well
      setTimeout(() => {
        api
          .addStock(formData)
          .then(({ stocks, lastUpdated }) => {
            api.getCurrencies().then(currencies => {
              this.setState({
                isLoading: false,
                lastUpdated,
                stocks,
                sum: utils.sumAndConvert(stocks, currencies, "NOK")
              });
            });
          })
          .catch(e => {
            this.setState({ isLoading: false });
            alert(e);
          });
      }, 700);
    });
  };

  showForm = () => {
    this.setState({ formIsVisible: true });
  };

  toggleMenu = () => {
    this.setState(state => ({ menuIsVisible: !state.menuIsVisible }));
  };

  deleteStock = id => {
    api.deleteStock(id).then(stocks => {
      api.getCurrencies().then(currencies => {
        this.setState({
          stocks,
          sum: utils.sumAndConvert(stocks, currencies, "NOK")
        });
      });
    });
  };

  deleteAllStocks = () => {
    api.deleteAllStocks();
    this.setState({ stocks: [], sum: 0 });
  };

  render() {
    const stocksWithLoader = this.state.stocks.map(stock => (
      <Stock key={stock.id} onDelete={this.deleteStock} {...stock} />
    ));

    stocksWithLoader.push(
      this.state.isLoading && (
        <Spinner type="tbody" key="spinner">
          {spinnerEl => (
            <tr>
              <td colSpan={3}>{spinnerEl}</td>
            </tr>
          )}
        </Spinner>
      )
    );

    return [
      <Menu
        isVisible={this.state.menuIsVisible}
        key="menu"
        deleteAllStocks={this.deleteAllStocks}
      />,
      <div
        className={cn("content", { menuIsVisible: this.state.menuIsVisible })}
        key="content"
      >
        <Header
          menuIsVisible={this.state.menuIsVisible}
          toggleMenu={this.toggleMenu}
        />

        <Moneys lastUpdated={this.state.lastUpdated} sum={this.state.sum} />

        <Collapse isOpened={true}>
          <FlipMove
            className="stocks"
            duration={700}
            easing="cubic-bezier(0.25, 0.12, 0.22, 1)"
            staggerDurationBy={50}
            typeName="table"
          >
            {stocksWithLoader.map(element => element)}
          </FlipMove>
        </Collapse>

        <div className="form-container">
          <Collapse isOpened={this.state.formIsVisible}>
            <Form onSubmit={this.addStock} />
          </Collapse>

          <button
            className="form-button"
            onClick={this.showForm}
            type="button"
            disabled={this.state.formIsVisible}
          >
            +
          </button>
        </div>
      </div>
    ];
  }
}

export default Main;
