import React from "react";

import cn from "classnames";
import { UnmountClosed as Collapse } from "react-collapse";
import FlipMove from "react-flip-move";
import get from "lodash/get";

import api from "../js/api-helper";
import languages from "../data/languages";
import settings from "../settings";
import storage from "../js/storage-helper";

import Form from "./form";
import Header from "./header";
import Menu from "./menu";
import Moneys from "./moneys";
import RealizedStock from "./realized-stock";
import Stock from "./stock";

const getLanguageLabels = langId => {
  return languages.reduce((accum, lang) => {
    if (lang.id === langId) {
      return lang.labels;
    } else {
      return accum;
    }
  }, {});
};

class Main extends React.Component {
  state = {
    currencies: get(storage.getStoredData("currencies"), "data", {}),
    formIsVisible: false,
    graphData: storage.getGraphPoints(),
    isLoading: api.hasStoredStocks(),
    labels: getLanguageLabels(storage.getUserLanguage()),
    languages: languages.map(({ id, name }) => ({ id, name })),
    shouldConvertStocks: storage.getShouldConvertStocks(),
    stocks: [],
    userCurrency: storage.getUserCurrency(),
    userLanguage: storage.getUserLanguage()
  };

  componentDidMount() {
    this.setState(
      { stocks: get(storage.getStoredData("stocks"), "data", []) },
      () => {
        setTimeout(() => {
          this.refreshData();
        }, 1000);
      }
    );

    api.getCurrencies().then(currencies => {
      this.setState({ currencies });
    });

    this.setState({
      scrollWrapperWidth: `calc(100% + ${this.scrollWrapper.offsetWidth -
        this.scrollWrapper.clientWidth}px)`
    });
  }

  componentWillUnmount() {
    clearInterval(this.updateLoop);
  }

  refreshData = () => {
    this.updateLoop = setTimeout(this.refreshData, settings.updateInterval);
    console.log("Updating");
    this.setState({ isLoading: true }, () => {
      api
        .getData()
        .then(newState => {
          console.log("Updated");
          this.setState(
            Object.assign({}, newState, {
              isLoading: false
            })
          );
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
          .then(newState => {
            this.setState(
              Object.assign({}, newState, {
                isLoading: false
              })
            );
          })
          .catch(() => {
            this.setState({ isLoading: false });
            alert(this.state.labels.main.stockNotFound);
          });
      }, 700);
    });
  };

  showForm = () => {
    this.setState({ formIsVisible: true });
  };

  hideForm = () => {
    this.setState({ formIsVisible: false });
  };

  toggleMenu = () => {
    this.setState(state => ({ menuIsVisible: !state.menuIsVisible }));
  };

  realizeStock = id => {
    const sellPrice = prompt(
      this.state.labels.main.realizeStockPrompt +
        ` (${this.state.userCurrency})`
    );

    if (id && sellPrice && sellPrice.search(",") === -1) {
      api.realizeStock(id, parseFloat(sellPrice)).then(newState => {
        this.setState(newState);
      });
    } else if (!id) {
      alert(this.state.labels.main.realizeStockFailedId);
    } else {
      alert(this.state.labels.main.realizeStockFailedPrice);
    }
  };

  deleteStock = id => {
    if (confirm(this.state.labels.main.deleteConfirmation)) {
      api.deleteStock(id).then(newState => {
        this.setState(newState);
      });
    }
  };

  deleteAllData = () => {
    if (confirm(this.state.labels.main.deleteAllConfirmation)) {
      api.deleteAllData();
    }
  };

  onCurrencySelect = currency => {
    storage.setUserCurrency(currency);
  };

  onLanguageSelect = language => {
    storage.setUserLanguage(language);
    this.setState({
      labels: getLanguageLabels(language)
    });
  };

  onShouldConvertStocksSelect = shouldConvertStocks => {
    storage.setShouldConvertStocks(shouldConvertStocks);
    this.setState({ shouldConvertStocks });
  };

  render() {
    const stocks = this.state.stocks
      .filter(stock => !stock.isRealized)
      .map(stock => (
        <Stock
          currencies={this.state.currencies}
          key={stock.id}
          labels={this.state.labels.stock}
          onDelete={this.deleteStock}
          onRealize={this.realizeStock}
          shouldConvertCurrency={this.state.shouldConvertStocks}
          userCurrency={this.state.userCurrency}
          {...stock}
        />
      ))
      .concat(
        this.state.stocks
          .filter(stock => stock.isRealized)
          .map(stock => (
            <RealizedStock
              key={stock.id}
              labels={this.state.labels.realizedStock}
              onDelete={this.deleteStock}
              userCurrency={this.state.userCurrency}
              {...stock}
            />
          ))
      );

    return (
      <div className="scroll-wrapper-outer">
        <div
          className="scroll-wrapper-inner"
          ref={div => (this.scrollWrapper = div)}
          style={{ width: this.state.scrollWrapperWidth }}
        >
          <Menu
            currencies={this.state.currencies}
            deleteAllData={this.deleteAllData}
            isVisible={this.state.menuIsVisible}
            labels={this.state.labels.menu}
            languages={this.state.languages}
            onCurrencySelect={this.onCurrencySelect}
            onLanguageSelect={this.onLanguageSelect}
            onShouldConvertStocksSelect={this.onShouldConvertStocksSelect}
            userCurrency={this.state.userCurrency}
            userLanguage={this.state.userLanguage}
          />
          <div
            className={cn("content", {
              menuIsVisible: this.state.menuIsVisible
            })}
          >
            <Header
              isLoading={this.state.isLoading}
              menuIsVisible={this.state.menuIsVisible}
              toggleMenu={this.toggleMenu}
            />

            <Moneys
              graphData={this.state.graphData}
              labels={this.state.labels.moneys}
              sum={this.state.sum}
              userCurrency={this.state.userCurrency}
            />

            <Collapse isOpened={true}>
              <FlipMove
                className="stocks"
                duration={700}
                easing="cubic-bezier(0.25, 0.12, 0.22, 1)"
                staggerDurationBy={50}
                typeName="table"
              >
                {stocks.map(element => element)}
              </FlipMove>
            </Collapse>

            <div className="form-container">
              <Collapse isOpened={this.state.formIsVisible}>
                <Form
                  currencies={this.state.currencies}
                  labels={this.state.labels.form}
                  onSubmit={this.addStock}
                  onCancelClick={this.hideForm}
                  userCurrency={this.state.userCurrency}
                />
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
        </div>
      </div>
    );
  }
}

export default Main;
