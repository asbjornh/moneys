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
    hasAvailableUpdate: false,
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
    if (window.applicationCache) {
      applicationCache.addEventListener("updateready", () => {
        this.setState({ hasAvailableUpdate: true });
      });
    }

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
                  labels={labels.moneys}
                  sum={this.state.sum}
                  userCurrency={this.state.userCurrency}
                />
              )}
            </TinyTransition>

            <TinyTransition duration={1000}>
              {!!this.state.stocks.length && (
                <SortableList
                  className="stocks"
                  element="table"
                  helperClass="stock-is-sorting"
                  lockAxis="y"
                  onSortEnd={this.onSortEnd}
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
        </div>
      </div>
    );
  }
}

export default Main;
