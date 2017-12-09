import get from "lodash/get";

import config from "../../config.json";
import cryptoCurrencies from "../data/cryptocurrencies.json";
import storage from "./storage-helper";
import utils from "./utils";
import yahooHelper from "../js/yahoo-helper";

const headers = new Headers(
  !config.proxy
    ? {}
    : {
        Origin: window.location
      }
);

let currencyNames = [];
function getCurrencyNames() {
  const storedCurrencyNames = get(
    storage.getStoredData("currencyNames"),
    "data",
    []
  );

  return new Promise(resolve => {
    if (currencyNames.length) {
      resolve(currencyNames);
    } else {
      fetch(`${config.proxy}${config.currencyNamesEndpoint}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Couldn't get currency names");
          }
        })
        .then(json => {
          currencyNames = json.data;
          storage.storeData("currencyNames", currencyNames);
          resolve(currencyNames);
        })
        .catch(e => {
          console.log(e);
          resolve(storedCurrencyNames);
        });
    }
  });
}

function getCurrencies() {
  const storedCurrencies = storage.getStoredData("currencies");

  return new Promise(resolve => {
    fetch(config.exchangeRatesEndpoint)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          resolve(storedCurrencies.data);
        }
      })
      .then(currencies => {
        if (currencies) {
          storage.storeData("currencies", currencies.data.rates);
          resolve(currencies.data.rates);
        }
      })
      .catch(e => {
        console.log(e);
        resolve(storedCurrencies.data);
      });
  });
}

function getHistoricalCurrencyData(date) {
  return new Promise((resolve, reject) => {
    fetch(
      `${config.proxy}${config.historicalExchangeRatesEndpoint
        .replace("{0}", date)
        .replace("{1}", config.openExchangeRatesAppId)}`,
      { headers }
    )
      .then(response => response.json())
      .then(json => {
        resolve(json.rates);
      })
      .catch(e => {
        console.log(e);
        reject("Failed to get historical currency data");
      });
  });
}

function getStock({ symbol, type, intermediateCurrency }, storedStock) {
  if (type && type.toLowerCase() === "currency") {
    return getCurrencySellPrice(
      symbol,
      intermediateCurrency || storage.getUserCurrency(),
      storedStock
    );
  } else {
    return getStockData(symbol, storedStock);
  }
}

function getCurrencySellPrice(fromCurrency, toCurrency, storedStock) {
  return new Promise((resolve, reject) => {
    function resolveWithBackup() {
      if (storedStock) {
        return resolve(
          Object.assign({}, storedStock, {
            isOutdated: true
          })
        );
      } else {
        reject("Failed to get stock data");
        throw new Error("Failed to get stock data");
      }
    }

    fetch(
      config.currencySellPriceEndpoint.replace(
        "{0}",
        `${fromCurrency}-${toCurrency}`
      )
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          resolveWithBackup();
        }
      })
      .then(json => {
        getCurrencyNames().then(currencyNames => {
          resolve({
            currency: toCurrency,
            longName: get(
              currencyNames.find(
                currencyName => currencyName.id === fromCurrency
              ),
              "name",
              cryptoCurrencies[fromCurrency]
            ),
            price: parseFloat(get(json, "data.amount", 0))
          });
        });
      })
      .catch(e => {
        console.log(e);
        resolveWithBackup();
      });
  });
}

function getStockData(symbol, storedStock) {
  return new Promise(resolve => {
    function resolveWithBackup() {
      if (storedStock) {
        return resolve(
          Object.assign({}, storedStock, {
            isOutdated: true
          })
        );
      } else {
        throw new Error("Failed to get stock data");
      }
    }

    fetch(
      `${config.proxy}${config.stockEndpoint.replace(
        "{0}",
        symbol.toUpperCase()
      )}`,
      { headers }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          resolveWithBackup();
        }
      })
      .then(json => {
        const data = config.isUsingServer
          ? Object.assign({}, json, {
              price: parseFloat(json.price),
              longName: json.longName.replace(/&amp;/g, "&")
            })
          : yahooHelper.getStockData(json);

        if (data) {
          resolve(data);
        } else {
          resolveWithBackup();
        }
      })
      .catch(e => {
        console.log(e);
        resolveWithBackup();
      });
  });
}

function hasStoredStocks() {
  return !!storage.getUserStocks().length;
}

function getData() {
  return new Promise((resolve, reject) => {
    const userStocks = storage.getUserStocks();
    const storedStocks = storage.getStoredData("stocks");

    getCurrencies().then(currencies => {
      if (
        storedStocks &&
        !storedStocks.isOutdated &&
        storedStocks.data &&
        storedStocks.data.length >= userStocks.length
      ) {
        const sum = utils.sumAndConvert(
          storedStocks.data,
          currencies,
          storage.getUserCurrency()
        );
        storage.addGraphPoint(sum.difference);
        resolve({
          lastUpdated: storedStocks.timeStamp,
          stocks: storedStocks.data,
          sum,
          graphData: storage.getGraphPoints()
        });
      } else {
        Promise.all(
          userStocks.map(stock => {
            if (!stock.isRealized) {
              return getStock(
                stock,
                get(storedStocks, "data", []).find(
                  storedStock => storedStock.id === stock.id
                )
              );
            } else {
              return new Promise(resolve => {
                resolve(stock);
              });
            }
          })
        )
          .then(stockData => {
            // Merge userStocks data and stockData
            const stocks = userStocks.map((stock, index) =>
              Object.assign({}, stock, stockData[index])
            );

            const sum = utils.sumAndConvert(
              stocks,
              currencies,
              storage.getUserCurrency()
            );
            storage.storeData("stocks", stocks);
            storage.addGraphPoint(sum.difference);
            resolve({
              stocks,
              lastUpdated: new Date().getTime(),
              sum,
              graphData: storage.getGraphPoints()
            });
          })
          .catch(e => {
            console.log(e);
            reject("Failed to get new stock data");
          });
      }
    });
  });
}

function getPurchaseRate(stock, stockCurrency) {
  return new Promise(resolve => {
    if (stock.purchaseRate) {
      resolve(stock.purchaseRate);
    } else {
      getHistoricalCurrencyData(stock.purchaseDate).then(
        historicalCurrencies => {
          resolve(
            utils.convert(
              parseFloat(stock.purchasePrice) / parseFloat(stock.qty),
              storage.getUserCurrency(),
              stockCurrency,
              historicalCurrencies
            )
          );
        }
      );
    }
  });
}

function addStock(formData) {
  return new Promise((resolve, reject) => {
    getStock(formData)
      .then(stockData => {
        // Get exchange rate at time of purchase
        getPurchaseRate(formData, stockData.currency)
          .then(purchaseRate => {
            const newStock = {
              id: String(new Date().getTime()),
              intermediateCurrency: formData.intermediateCurrency,
              purchasePrice: parseFloat(formData.purchasePrice),
              purchaseRate: parseFloat(purchaseRate),
              qty: parseFloat(formData.qty),
              symbol: formData.symbol,
              type: formData.type.toLowerCase()
            };

            const userStocks = storage.getUserStocks();
            storage.setUserStocks(userStocks.concat(newStock));

            getData()
              .then(({ stocks, lastUpdated, sum, graphData }) => {
                resolve({
                  stocks,
                  lastUpdated,
                  sum,
                  graphData
                });
              })
              .catch(e => {
                console.log(e);
                reject("Failed to get new stock data");
              });
          })
          .catch(e => {
            console.log(e);
            reject("Failed to get exchange rate at purchase date");
          });
      })
      .catch(e => {
        console.log(e);
        reject("Stock not found");
      });
  });
}

function deleteStock(id) {
  return new Promise(resolve => {
    const userStocks = storage.getUserStocks();
    storage.setUserStocks(userStocks.filter(stock => stock.id !== id));
    const stocks = storage.getStoredData("stocks");
    storage.storeData("stocks", stocks.data.filter(stock => stock.id !== id));

    getData().then(({ stocks, sum, lastUpdated, graphData }) => {
      resolve({ stocks, sum, lastUpdated, graphData });
    });
  });
}

function realizeStock(id, sellPrice) {
  return new Promise(resolve => {
    const userStocks = storage.getUserStocks();
    const realizedStock = userStocks.find(stock => stock.id === id);
    realizedStock.isRealized = true;
    realizedStock.sellPrice = sellPrice;
    realizedStock.sellDate = new Date().getTime();
    storage.setUserStocks(userStocks);

    getData().then(({ stocks, sum, lastUpdated, graphData }) => {
      resolve({ stocks, sum, lastUpdated, graphData });
    });
  });
}

function deleteAllData() {
  localStorage.clear();
  window.location.reload();
}

export default {
  addStock,
  deleteAllData,
  deleteStock,
  getCurrencies,
  getData,
  hasStoredStocks,
  realizeStock
};
