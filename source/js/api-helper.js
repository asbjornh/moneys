import get from "lodash/get";

import config from "../../config.json";
import cryptoCurrencies from "../data/cryptocurrencies.json";
import settings from "../settings.json";
import utils from "./utils";

const fuckYouCORS = "https://cors-anywhere.herokuapp.com/";

// function getFromApi(url) {
//   return new Promise(resolve => {
//     fetch(url)
//       .then(response => response.json())
//       .then(json => {
//         if (json.success) {
//           resolve(json.payload);
//         } else {
//           throw new Error("Bad response from API");
//         }
//       });
//   });
// }

function getUserStocks() {
  return JSON.parse(localStorage.getItem("userStocks")) || [];
}

function setUserStocks(stocks) {
  localStorage.setItem("userStocks", JSON.stringify(stocks));
}

function getUserCurrency() {
  return localStorage.getItem("userCurrency") || "NOK";
}

function setUserCurrency(currency) {
  localStorage.clear();
  localStorage.setItem("userCurrency", currency);
  window.location.reload();
}

function getUserLanguage() {
  return localStorage.getItem("userLanguage") || "english";
}

function setUserLanguage(language) {
  localStorage.setItem("userLanguage", language);
}

function getBackupData() {
  return JSON.stringify({
    userStocks: JSON.parse(localStorage.getItem("userStocks")),
    graphData: JSON.parse(localStorage.getItem("graphData"))
  });
}

function insertBackupData(data) {
  const newData = JSON.parse(data);

  Object.keys(newData).forEach(key => {
    localStorage.setItem(key, JSON.stringify(newData[key]));
  });

  window.location.reload();
}

function addGraphPoint(sum = 0) {
  const points = JSON.parse(localStorage.getItem("graphData")) || [];
  const lastPoint = points[points.length - 1];
  const newPoint = {
    x: new Date(new Date().toDateString()).getTime(),
    y: parseFloat(sum.toFixed(2))
  };

  if (
    lastPoint &&
    new Date().getTime() - lastPoint.x < settings.graph.updateInterval
  ) {
    // Last point is newer than 24 hours. Update point
    points[points.length - 1] = Object.assign({}, newPoint);
  } else {
    // Last point is older than 24 hours or does not exist. Add new point
    points.push(newPoint);
  }

  if (sum) {
    localStorage.setItem("graphData", JSON.stringify(points));
  }
}

function getGraphPoints() {
  return JSON.parse(localStorage.getItem("graphData")) || [];
}

function getStoredData(key) {
  const data = JSON.parse(localStorage.getItem(key));

  if (data && new Date().getTime() - data.timeStamp < settings.storage.maxAge) {
    console.log(`Using stored ${key} data`);
    return data;
  } else {
    return false;
  }
}

function storeData(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timeStamp: new Date().getTime()
    })
  );
}

let currencyNames = [];
function getCurrencyNames() {
  return new Promise(resolve => {
    if (currencyNames.length) {
      resolve(currencyNames);
    } else {
      fetch(`${fuckYouCORS}https://api.coinbase.com/v2/currencies`)
        .then(response => response.json())
        .then(json => {
          currencyNames = json.data;
          resolve(currencyNames);
        });
    }
  });
}

function getCurrencies() {
  return new Promise(resolve => {
    fetch("https://api.coinbase.com/v2/exchange-rates")
      .then(response => response.json())
      .then(currencies => {
        resolve(currencies.data.rates);
      })
      .catch(e => {
        console.log(e);
      });
  });
}

function getHistoricalCurrencyData(date) {
  return new Promise((resolve, reject) => {
    fetch(
      `${fuckYouCORS}https://openexchangerates.org/api/historical/${
        date
      }.json?app_id=${config.openExchangeRatesAppId}`,
      {
        headers: new Headers({
          "Content-Type": "application/json",
          Origin: window.location
        })
      }
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

function getStock({ symbol, type, intermediateCurrency }) {
  if (type && type.toLowerCase() === "currency") {
    return getCurrencyPair(symbol, intermediateCurrency || getUserCurrency());
  } else {
    return getStockData(symbol);
  }
}

function getCurrencyPair(fromCurrency, toCurrency) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.coinbase.com/v2/prices/${fromCurrency}-${toCurrency}/spot`,
      {
        headers: new Headers({
          "CB-VERSION": "2017-12-01"
        })
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Stock not found");
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
        reject("Stock not found");
      });
  });
}

function getStockData(symbol) {
  console.log(`Getting data for ${symbol}`);
  return fetch(
    `${
      fuckYouCORS
    }https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol.toUpperCase()}?formatted=false&modules=price`,
    {
      headers: new Headers({
        "Content-Type": "application/json",
        Origin: window.location
      })
    }
  )
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Stock not found");
      }
    })
    .then(json => {
      const data = get(json, "quoteSummary.result[0]");

      if (data) {
        const longName =
          cryptoCurrencies[symbol] ||
          get(data, "price.longName") ||
          get(data, "price.shortName") ||
          get(data, "price.symbol");

        return {
          currency: get(data, "price.currency"),
          currencySymbol: get(data, "price.currencySymbol"),
          longName: longName.replace(/&amp;/g, "&"),
          price: get(data, "price.regularMarketPrice")
        };
      } else {
        throw new Error("Unexpected response");
      }
    });
}

function hasStoredStocks() {
  return !!getUserStocks().length;
}

function getData() {
  return new Promise((resolve, reject) => {
    const userStocks = getUserStocks();
    const storedStocks = getStoredData("stocks");

    getCurrencies().then(currencies => {
      if (
        storedStocks &&
        storedStocks.data &&
        storedStocks.data.length >= userStocks.length
      ) {
        const stocks = userStocks.map(stock => {
          return Object.assign(
            {},
            stock,
            storedStocks.data.find(ss => ss.id === stock.id)
          );
        });

        const sum = utils.sumAndConvert(stocks, currencies, getUserCurrency());
        addGraphPoint(sum.difference);
        resolve({
          lastUpdated: storedStocks.timeStamp,
          stocks,
          sum,
          graphData: getGraphPoints()
        });
      } else {
        console.log("Getting new stock data");
        Promise.all(
          userStocks.map(stock => {
            if (!stock.isRealized) {
              return getStock(stock);
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
              getUserCurrency()
            );
            storeData("stocks", stocks);
            addGraphPoint(sum.difference);
            resolve({
              stocks,
              lastUpdated: new Date().getTime(),
              sum,
              graphData: getGraphPoints()
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
              getUserCurrency(),
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

            const userStocks = getUserStocks();
            setUserStocks(userStocks.concat(newStock));

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
    const userStocks = getUserStocks();
    setUserStocks(userStocks.filter(stock => stock.id !== id));
    const stocks = getStoredData("stocks");
    storeData("stocks", stocks.data.filter(stock => stock.id !== id));

    getData().then(({ stocks, sum, lastUpdated, graphData }) => {
      resolve({ stocks, sum, lastUpdated, graphData });
    });
  });
}

function realizeStock(id, sellPrice) {
  return new Promise(resolve => {
    const userStocks = getUserStocks();
    const realizedStock = userStocks.find(stock => stock.id === id);
    realizedStock.isRealized = true;
    realizedStock.sellPrice = sellPrice;
    realizedStock.sellDate = new Date().getTime();
    setUserStocks(userStocks);

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
  getBackupData,
  getCurrencies,
  getGraphPoints,
  getData,
  getUserCurrency,
  getUserLanguage,
  hasStoredStocks,
  insertBackupData,
  realizeStock,
  setUserCurrency,
  setUserLanguage
};
