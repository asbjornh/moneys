import React from "react";

import { arrayMove } from "react-sortable-hoc";
import cn from "classnames";
import { UnmountClosed as Collapse } from "react-collapse";
import get from "lodash/get";

import api from "../js/api-helper";
import languages from "../data/languages";
import settings from "../settings";
import storage from "../js/storage-helper";

import Form from "./form";
import Header from "./header";
import Menu from "./menu";
import Moneys from "./moneys";
import NoScrollbar from "./no-scrollbar";
import RealizedStock from "./realized-stock";
import Stock from "./stock";
import SortableList from "./sortable-list/";
import TinyTransition from "react-tiny-transition";

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
    graphReady: false,
    hasAvailableUpdate: false,
    hasMouseScroll: true,
    isLoading: api.hasStoredStocks(),
    isSorting: false,
    labels: getLanguageLabels(storage.getUserSetting("language")),
    languages: languages.map(({ id, name }) => ({ id, name })),
    shouldConvertStocks: storage.getUserSetting("shouldConvertStocks"),
    stocks: [],
    userCurrency: storage.getUserSetting("currency"),
    userLanguage: storage.getUserSetting("language")
  };

  componentDidMount() {
    // api.init(this.onNewData);

    if (window.applicationCache) {
      applicationCache.addEventListener("updateready", () => {
        this.setState({ hasAvailableUpdate: true });
      });
    }

    this.setState(
      { stocks: get(storage.getStoredData("stocks"), "data", []) },
      () => {
        setTimeout(() => {
          // this.refreshData();
          api.init(this.onNewData);
        }, 1000);
      }
    );

    window.addEventListener("touchstart", this.onMouseWheel);
  }

  componentWillUnmount() {
    clearInterval(this.updateLoop);
    window.removeEventListener("touchstart", this.onMouseWheel);
  }

  onNewData = newStocks => {
    // console.log("new data", newData);
    this.setState({ isLoading: false, stocks: newStocks });
  };

  onMouseWheel = () => {
    if (this.state.hasMouseScroll) {
      this.setState({ hasMouseScroll: false });
    }
  };

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
              graphReady: true,
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
          .catch(stockName => {
            this.setState({ isLoading: false });
            alert(this.state.labels.main.stockNotFound + ` '${stockName}'`);
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
    storage.setUserSetting("currency", currency);
  };

  onLanguageSelect = language => {
    storage.setUserSetting("language", language);
    this.setState({
      labels: getLanguageLabels(language)
    });
  };

  onShouldConvertStocksSelect = shouldConvertStocks => {
    storage.setUserSetting("shouldConvertStocks", shouldConvertStocks);
    this.setState({ shouldConvertStocks });
  };

  toggleSorting = () => {
    this.setState(state => ({ isSorting: !state.isSorting }));
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex && !this.state.isLoading) {
      storage.sortUserStocks({ oldIndex, newIndex });
    }

    this.setState(state => {
      return {
        stocks: this.state.isLoading
          ? state.stocks
          : arrayMove(state.stocks, oldIndex, newIndex)
      };
    });
  };

  render() {
    const labels = this.state.labels;

    return (
      <NoScrollbar>
        <Menu
          currencies={this.state.currencies}
          deleteAllData={this.deleteAllData}
          isVisible={this.state.menuIsVisible}
          labels={labels.menu}
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
            hasAvailableUpdate={this.state.hasAvailableUpdate}
            isLoading={this.state.isLoading}
            isSorting={this.state.isSorting}
            labels={labels.header}
            menuIsVisible={this.state.menuIsVisible}
            onSortingButtonClick={this.toggleSorting}
            toggleMenu={this.toggleMenu}
          />

          <TinyTransition duration={1000}>
            {!!this.state.stocks.length && (
              <Moneys
                graphData={this.state.graphData}
                graphReady={this.state.graphReady}
                labels={labels.moneys}
                sum={this.state.sum}
                userCurrency={this.state.userCurrency}
              />
            )}
          </TinyTransition>

          <TinyTransition duration={1000}>
            {!!this.state.stocks.length && (
              <Collapse isOpened={true}>
                <SortableList
                  className="stocks"
                  element="table"
                  helperClass="stock-is-sorting"
                  lockAxis="y"
                  onSortEnd={this.onSortEnd}
                  pressDelay={this.state.hasMouseScroll ? 0 : 300}
                  shouldCancelStart={() =>
                    this.state.isLoading || !this.state.isSorting
                  }
                >
                  {this.state.stocks.map(
                    stock =>
                      !stock.isRealized ? (
                        <Stock
                          currencies={this.state.currencies}
                          isSorting={this.state.isSorting}
                          key={stock.id}
                          labels={labels.stock}
                          onDelete={this.deleteStock}
                          onRealize={this.realizeStock}
                          shouldConvertCurrency={this.state.shouldConvertStocks}
                          userCurrency={this.state.userCurrency}
                          {...stock}
                        />
                      ) : (
                        <RealizedStock
                          isSorting={this.state.isSorting}
                          key={stock.id}
                          labels={labels.realizedStock}
                          onDelete={this.deleteStock}
                          userCurrency={this.state.userCurrency}
                          {...stock}
                        />
                      )
                  )}
                </SortableList>
              </Collapse>
            )}
          </TinyTransition>

          <div className="form-container">
            <Collapse isOpened={this.state.formIsVisible}>
              <Form
                currencies={this.state.currencies}
                labels={labels.form}
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
      </NoScrollbar>
    );
  }
}

export default Main;
