import get from "lodash/get";

import settings from "../settings.json";

function getUserStocks() {
  return JSON.parse(localStorage.getItem("userStocks")) || [];
}

function setUserStocks(stocks) {
  localStorage.setItem("userStocks", JSON.stringify(stocks));
}

function getStoredData(key) {
  const data = JSON.parse(localStorage.getItem(key));

  if (data && new Date().getTime() - data.timeStamp < settings.storage.maxAge) {
    console.log(`using stored ${key} data`);
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

function getCurrencyData() {
  return new Promise((resolve, reject) => {
    fetch(
      "https://cors-anywhere.herokuapp.com/https://openexchangerates.org/api/latest.json?app_id=4a4d89fbd62942c6ba24dbb60b7f67a0"
    )
      .then(response => response.json())
      .then(json => {
        storeData("currencies", json);
        resolve(json);
      })
      .catch(() => {
        reject("Klarte ikke å hente valuta");
      });
  });
}

function getCurrencies() {
  return new Promise((resolve, reject) => {
    const currencies = getStoredData("currencies");

    if (currencies && currencies.data) {
      resolve(currencies.data);
    } else {
      console.log("getting new currency data");
      getCurrencyData()
        .then(currencyData => {
          resolve(currencyData);
        })
        .catch(() => {
          reject("Klarte ikke å hente ny valuta-data. Bruker lagret versjon");
        });
    }
  });
}

function getStockData({ symbol, purchasePrice, qty, id }) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://cors-anywhere.herokuapp.com/https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol.toUpperCase()}?formatted=false&modules=price`,
      {
        headers: new Headers({
          "Content-Type": "application/json",
          Origin: "localhost"
        })
      }
    )
      .then(response => {
        return response.json();
      })
      .then(json => {
        const data = get(json, "quoteSummary.result[0]");

        if (data) {
          resolve({
            currency: get(data, "price.currency"),
            currencySymbol: get(data, "price.currencySymbol"),
            id,
            longName: get(data, "price.longName").replace(/&amp;/g, "&"),
            price: get(data, "price.regularMarketPrice"),
            purchasePrice: parseFloat(purchasePrice),
            qty: parseInt(qty),
            symbol: get(data, "price.symbol")
          });
        } else {
          console.log("no data");
          reject("Fant ikke aksje");
        }
      })
      .catch(() => {
        console.log("fetch failed");
        reject("Fant ikke aksje");
      });
  });
}

function hasStoredStocks() {
  return !!getUserStocks().length;
}

function getStocks() {
  return new Promise((resolve, reject) => {
    const userStocks = getUserStocks();
    const stocks = getStoredData("stocks");

    if (stocks && stocks.data) {
      resolve({
        stocks: stocks.data.filter(({ id }) => {
          return userStocks.find(stock => stock.id === id);
        }),
        lastUpdated: stocks.timeStamp
      });
    } else {
      console.log("Henter nye aksjedata");
      Promise.all(userStocks.map(stock => getStockData(stock)))
        .then(stocks => {
          storeData("stocks", stocks);
          resolve({ stocks: stocks.data, lastUpdated: stocks.timeStamp });
        })
        .catch(() => {
          reject("Klarte ikke å hente nye aksjedata");
        });
    }
  });
}

function addStock({ symbol, purchasePrice, qty }) {
  const id = symbol + purchasePrice + qty;

  return new Promise((resolve, reject) => {
    const userStocksList = getUserStocks();
    setUserStocks(
      userStocksList.concat({
        symbol,
        purchasePrice,
        qty,
        id
      })
    );

    getStocks().then(stocks => {
      getStockData({ symbol, purchasePrice, qty, id })
        .then(enrichedStock => {
          const newStocks = stocks.concat(enrichedStock);

          storeData("stocks", newStocks);
          resolve(newStocks);
        })
        .catch(() => {
          reject("Fant ikke aksje");
        });
    });
  });
}

function deleteStock(id) {
  return new Promise(resolve => {
    const userStocksList = getUserStocks();
    setUserStocks(userStocksList.filter(stock => stock.id !== id));

    getStocks().then(stocks => {
      resolve(stocks);
    });
  });
}

export default {
  addStock,
  deleteStock,
  getCurrencies,
  getStocks,
  hasStoredStocks
};
