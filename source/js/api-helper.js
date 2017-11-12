import get from "lodash/get";

import settings from "../settings.json";
import utils from "./utils";

function getUserStocks() {
  return JSON.parse(localStorage.getItem("userStocks")) || [];
}

function setUserStocks(stocks) {
  localStorage.setItem("userStocks", JSON.stringify(stocks));
}

function getBackupData() {
  return JSON.stringify({
    userStocks: JSON.parse(localStorage.getItem("userStocks")),
    graphData: JSON.parse(localStorage.getItem("graphData"))
  });
}

function addGraphPoint(stocks) {
  const points = JSON.parse(localStorage.getItem("graphData")) || [];
  const lastPoint = points.slice(-1)[0];

  if (
    lastPoint &&
    new Date().getTime() - lastPoint.x < settings.graph.updateInterval
  ) {
    return;
  }

  getCurrencies().then(currencies => {
    const sum = utils.sumAndConvert(stocks, currencies);
    sum &&
      localStorage.setItem(
        "graphData",
        JSON.stringify(
          points.concat({
            x: new Date().getTime(),
            y: parseFloat(sum).toFixed(2)
          })
        )
      );
  });
}

function getGraphPoints() {
  return JSON.parse(localStorage.getItem("graphData"));
}

function getStoredData(key) {
  const data = JSON.parse(localStorage.getItem(key));

  if (data && new Date().getTime() - data.timeStamp < settings.storage.maxAge) {
    console.log(`Bruker lagret data for '${key}'`);
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
      .catch(e => {
        console.log(e);
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
      console.log("Henter nye valutadata");
      getCurrencyData()
        .then(currencyData => {
          resolve(currencyData);
        })
        .catch(e => {
          console.log(e);
          reject("Klarte ikke å hente ny valuta-data.");
        });
    }
  });
}

function getStockData({ symbol, purchasePrice, qty, id }) {
  console.log(`Henter data for ${symbol}`);
  return new Promise((resolve, reject) => {
    fetch(
      `https://cors-anywhere.herokuapp.com/https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol.toUpperCase()}?formatted=false&modules=price`,
      {
        headers: new Headers({
          "Content-Type": "application/json",
          Origin: "asbjorn.org"
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
          console.log("Server returned bad data");
          reject("Fant ikke aksje");
        }
      })
      .catch(e => {
        console.log(e);
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
      addGraphPoint(stocks.data);
      resolve({
        stocks: stocks.data.filter(({ id }) => {
          return !!userStocks.find(stock => stock.id === id);
        }),
        lastUpdated: stocks.timeStamp
      });
    } else {
      console.log("Henter nye aksjedata");
      Promise.all(userStocks.map(stock => getStockData(stock)))
        .then(stocks => {
          console.log("Fant aksjedata", stocks);
          storeData("stocks", stocks);
          addGraphPoint(stocks);
          resolve({ stocks: stocks || [], lastUpdated: new Date().getTime() });
        })
        .catch(e => {
          console.log(e);
          reject("Klarte ikke å hente nye aksjedata");
        });
    }
  });
}

function addStock({ symbol, purchasePrice, qty }) {
  const id = String(new Date().getTime());

  return new Promise((resolve, reject) => {
    if (!symbol || !purchasePrice || !qty) {
      reject("Fyll ut alle feltene");
    } else {
      const userStocksList = getUserStocks();
      setUserStocks(
        userStocksList.concat({
          symbol,
          purchasePrice,
          qty,
          id
        })
      );

      getStocks().then(({ stocks, lastUpdated }) => {
        getStockData({ symbol, purchasePrice, qty, id })
          .then(enrichedStock => {
            const newStocks = stocks.concat(enrichedStock);

            storeData("stocks", newStocks);
            resolve({ stocks: newStocks, lastUpdated: lastUpdated });
          })
          .catch(e => {
            console.log(e);
            reject("Klarte ikke å hente aksjedata");
          });
      });
    }
  });
}

function deleteStock(id) {
  return new Promise(resolve => {
    const userStocksList = getUserStocks();
    setUserStocks(userStocksList.filter(stock => stock.id !== id));

    getStocks().then(({ stocks }) => {
      resolve(stocks);
    });
  });
}

function deleteAllStocks() {
  localStorage.removeItem("userStocks");
  localStorage.removeItem("stocks");
  localStorage.removeItem("graphData");
}

export default {
  addStock,
  deleteAllStocks,
  deleteStock,
  getBackupData,
  getCurrencies,
  getGraphPoints,
  getStocks,
  hasStoredStocks
};
