import * as firebase from "firebase/app";
import "firebase/database";

import firebaseConfig from "../../firebase-config.json";
import storage from "./storage-helper";
import utils from "./utils";

// yahoo uses dots in some of their ticker names, which firebase doesn't like. In firebase, keys with dots are stored with colons instead and need to be decoded.
function decodeTicker(ticker) {
  return ticker.replace(":", ".");
}

// Get firebase-compatible ticker name based on stock type
function getTicker(userStock) {
  const ticker = userStock.symbol;

  if (userStock.type === "currency") {
    const currency =
      userStock.intermediateCurrency || storage.getUserSetting("currency");

    return `${ticker}-${currency}`;
  } else {
    return ticker;
  }
}

// Find stocks that are present in userStocks but missing in firebase
function getMissingStocks(stockData) {
  return storage
    .getUserStocks()
    .filter(stock => !stock.isRealized)
    .reduce((accum, userStock) => {
      const ticker = getTicker(userStock);

      if (!stockData[ticker]) {
        accum.push(userStock);
      }

      return accum;
    }, []);
}

// This is where everything happens. When adding or deleting stocks to/from firebase, the callback wil be run with the updated data.
function init(callback) {
  const db = {};
  firebase.initializeApp(firebaseConfig.init);

  function resolve() {
    if (db.exchangeRates && db.stocks && db.currencies && db.cryptoNames) {
      const supportedCurrencies = Object.keys(db.cryptoNames).reduce(
        (accum, name) => {
          accum.push({ value: name, label: db.cryptoNames[name] });
          return accum;
        },
        []
      );

      let stockData = { ...db.stocks, ...db.currencies };

      // Decode stock ticker names
      stockData = Object.keys(stockData).reduce((accum, ticker) => {
        accum[decodeTicker(ticker)] = stockData[ticker];
        return accum;
      }, {});

      const missingStocks = getMissingStocks(stockData);

      if (missingStocks.length) {
        // This will run every time the database is updated, so in order to avoid duplicate calls to the add function, call only one at a time
        addStockToDatabase(missingStocks[0]);
      } else {
        const userStocks = storage.getUserStocks();
        const stocks = userStocks.reduce((accum, userStock) => {
          return accum.concat(
            Object.assign({}, userStock, stockData[getTicker(userStock)])
          );
        }, []);

        const sum = utils.sumAndConvert(
          stocks,
          db.exchangeRates,
          storage.getUserSetting("currency")
        );

        storage.storeData("exchangeRates", db.exchangeRates);
        storage.storeData("stocks", stocks);
        storage.addGraphPoint(sum.difference);

        callback({
          exchangeRates: db.exchangeRates,
          graphData: storage.getGraphPoints(),
          stocks,
          supportedCurrencies,
          sum
        });
      }
    }
  }

  if (!navigator.onLine) {
    // Resolve with data from localStorage
    const stocks = storage.getStoredData("stocks", []);
    const exchangeRates = storage.getStoredData("exchangeRates", []);
    callback({
      exchangeRates,
      graphData: storage.getGraphPoints(),
      stocks,
      sum: utils.sumAndConvert(
        stocks,
        exchangeRates,
        storage.getUserSetting("currency")
      )
    });
  } else {
    // Attach to firebase
    firebase
      .database()
      .ref("tickers")
      .orderByChild("type")
      .equalTo("currency")
      .on("value", snapshot => {
        console.log(new Date().toLocaleTimeString(), "Got currencies");
        db.currencies = snapshot.val() || {};
        resolve();
      });

    firebase
      .database()
      .ref("tickers")
      .orderByChild("type")
      .equalTo("stock")
      .on("value", snapshot => {
        console.log(new Date().toLocaleTimeString(), "Got stocks");
        db.stocks = snapshot.val() || {};
        resolve();
      });

    firebase
      .database()
      .ref("exchangeRates")
      .on("value", snapshot => {
        console.log(new Date().toLocaleTimeString(), "Got exchange rates");
        db.exchangeRates = snapshot.val();
        resolve();
      });

    firebase
      .database()
      .ref("cryptoNames")
      .once("value", snapshot => {
        db.cryptoNames = snapshot.val();
        resolve();
      });
  }
}

function addOrDelete(url, { intermediateCurrency, symbol, type }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify({
      currency:
        type === "currency"
          ? intermediateCurrency || storage.getUserSetting("currency")
          : null,
      ticker: symbol,
      type: type || "stock"
    })
  })
    .then(res => {
      return res.ok;
    })
    .catch(e => {
      console.log(e);
    });
}

function addStockToDatabase(stock) {
  return addOrDelete(firebaseConfig.addStockUrl, stock);
}

function deleteStockFromDatabase(stock) {
  return addOrDelete(firebaseConfig.deleteStockUrl, stock);
}

function addStock(formData) {
  return new Promise((resolve, reject) => {
    const id = String(new Date().getTime());
    const newStock = {
      id,
      intermediateCurrency: formData.intermediateCurrency,
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseRate: parseFloat(formData.purchaseRate),
      qty: parseFloat(formData.qty),
      symbol: formData.symbol,
      type: formData.type.toLowerCase()
    };

    // Add stock to user stocks list. This will be removed if the fetch fails
    const userStocks = storage.getUserStocks();
    storage.setUserStocks(userStocks.concat(newStock));

    addStockToDatabase(newStock).then(success => {
      if (success) {
        resolve();
      } else {
        deleteStock(id);
        reject(newStock.symbol);
      }
    });
  });
}

function deleteStock(id) {
  const userStocks = storage.getUserStocks();
  const stockToBeDeleted = userStocks.find(stock => stock.id === id);
  deleteStockFromDatabase(stockToBeDeleted);

  storage.setUserStocks(userStocks.filter(stock => stock.id !== id));

  const stocks = storage.getStoredData("stocks", []);
  storage.storeData("stocks", stocks.filter(stock => stock.id !== id));

  if (stockToBeDeleted.isRealized) {
    window.location.reload();
  }
}

function realizeStock(id, sellPrice) {
  const userStocks = storage.getUserStocks();
  const realizedStock = userStocks.find(stock => stock.id === id);
  realizedStock.isRealized = true;
  realizedStock.sellPrice = sellPrice;
  realizedStock.sellDate = new Date().getTime();
  storage.setUserStocks(userStocks);
  deleteStockFromDatabase(realizedStock);
}

export default {
  addStock,
  deleteStock,
  init,
  realizeStock
};
