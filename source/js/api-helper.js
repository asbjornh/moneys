import get from "lodash/get";

import config from "../../config.json";
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

function getCurrencies() {
  const storedCurrencies = storage.getStoredData("currencies");

  return new Promise(resolve => {
    fetch(config.proxy + config.exchangeRatesEndpoint)
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

function getStock({ symbol, type, intermediateCurrency }, storedStock) {
  if (type && type.toLowerCase() === "currency") {
    return getCurrencySellPrice(
      symbol,
      intermediateCurrency || storage.getUserSetting("currency"),
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
      }
    }

    fetch(
      `${config.proxy +
        config.currencySellPriceEndpoint}?ticker=${fromCurrency}&currency=${toCurrency}`
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          resolveWithBackup();
        }
      })
      .then(json => {
        resolve({
          currency: get(json, "currency"),
          longName: get(json, "longName"),
          price: parseFloat(get(json, "price", 0))
        });
      })
      .catch(e => {
        console.log(e);
        resolveWithBackup();
      });
  });
}

function getStockData(symbol, storedStock) {
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
          storage.getUserSetting("currency")
        );
        storage.addGraphPoint(sum.difference);
        resolve({
          currencies,
          graphData: storage.getGraphPoints(),
          stocks: storedStocks.data,
          sum
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
            const stocks = userStocks.map((stock, index) => {
              const isOutdated = get(stockData, `[${index}].isOutdated`, false);
              return Object.assign(
                {},
                stock,
                stockData[index],
                isOutdated
                  ? {}
                  : {
                      lastUpdated: new Date().getTime()
                    }
              );
            });

            const sum = utils.sumAndConvert(
              stocks,
              currencies,
              storage.getUserSetting("currency")
            );
            storage.storeData("stocks", stocks);
            storage.addGraphPoint(sum.difference);
            resolve({
              currencies,
              graphData: storage.getGraphPoints(),
              stocks,
              sum
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

function addStock(formData) {
  return new Promise((resolve, reject) => {
    // Try to fetch stock from API. Reject promise if no stock was found
    getStock(formData)
      .then(() => {
        const newStock = {
          id: String(new Date().getTime()),
          intermediateCurrency: formData.intermediateCurrency,
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseRate: parseFloat(formData.purchaseRate),
          qty: parseFloat(formData.qty),
          symbol: formData.symbol,
          type: formData.type.toLowerCase()
        };

        const userStocks = storage.getUserStocks();
        storage.setUserStocks(userStocks.concat(newStock));

        getData()
          .then(({ stocks, sum, graphData }) => {
            resolve({
              stocks,
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
        reject(formData.symbol);
      });
  });
}

function deleteStock(id) {
  return new Promise(resolve => {
    const userStocks = storage.getUserStocks();
    storage.setUserStocks(userStocks.filter(stock => stock.id !== id));
    const stocks = storage.getStoredData("stocks");
    storage.storeData("stocks", stocks.data.filter(stock => stock.id !== id));

    getData().then(({ stocks, sum, graphData }) => {
      resolve({ stocks, sum, graphData });
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

    getData().then(({ stocks, sum, graphData }) => {
      resolve({ stocks, sum, graphData });
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
