import get from "lodash/get";

function getCurrencyData() {
  return new Promise((resolve, reject) => {
    fetch(
      "https://cors-anywhere.herokuapp.com/https://openexchangerates.org/api/latest.json?app_id=4a4d89fbd62942c6ba24dbb60b7f67a0"
    )
      .then(response => response.json())
      .then(json => {
        localStorage.setItem(
          "currencies",
          JSON.stringify({
            data: json,
            timeStamp: new Date().getTime()
          })
        );
        resolve(json);
      })
      .catch(() => {
        reject("Klarte ikke å hente valuta");
      });
  });
}

function getCurrencies() {
  return getCurrencyData();
  // const storage = localStorage.getItem("currencies");

  // if (storage) {
  //   const currencies = JSON.parse(storage);

  //   if (new Date().getTime() - currencies.timeStamp < 10000) {
  //     return currencies.data;
  //   }
  // }
}

function getStockData({ symbol, purchasePrice, qty }) {
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
            id: symbol + purchasePrice + qty,
            longName: get(data, "price.longName").replace(/&amp;/g, "&"),
            price: get(data, "price.regularMarketPrice"),
            purchasePrice: parseFloat(purchasePrice),
            qty: parseInt(qty),
            symbol: get(data, "price.symbol")
          });
        } else {
          reject("Fant ikke aksje");
        }
      })
      .catch(() => {
        reject("Fant ikke aksje");
      });
  });
}

function hasStoredStocks() {
  return !!getStoredStocks().length;
}

function getStoredStocks() {
  const storage = localStorage.getItem("stocks");
  return storage ? get(JSON.parse(storage), "data", []) : [];
}

function storeStocks(stocks) {
  localStorage.setItem(
    "stocks",
    JSON.stringify({
      data: stocks,
      timeStamp: new Date().getTime()
    })
  );
}

function getStocks() {
  return new Promise(resolve => {
    Promise.all(
      getStoredStocks().map(stock => getStockData(stock))
    ).then(stocks => {
      storeStocks(stocks);
      resolve(stocks);
    });
  });
  // return new Promise(resolve => {
  //   resolve(getStoredStocks());
  // });
}

function addStock({ symbol, purchasePrice, qty }) {
  return new Promise((resolve, reject) => {
    const storedStocks = getStoredStocks();

    getStockData({ symbol, purchasePrice, qty })
      .then(enrichedStock => {
        const stocks = storedStocks.concat(enrichedStock);

        storeStocks(stocks);
        resolve(stocks);
      })
      .catch(() => {
        reject("Fant ikke aksje");
      });
  });
}

function deleteStock(id) {
  return new Promise(resolve => {
    const stocks = getStoredStocks().filter(stock => stock.id !== id);

    storeStocks(stocks);
    resolve(stocks);
  });
}

export default {
  addStock,
  deleteStock,
  getCurrencies,
  getStocks,
  hasStoredStocks
};
