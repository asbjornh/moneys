import get from "lodash/get";

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
            currency: get(data, "price.currencySymbol"),
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
      .catch(e => {
        reject("Fant ikke aksje");
      });
  });
}

function getStoredStocks() {
  const storage = localStorage.getItem("stocks");
  return storage ? JSON.parse(storage) : [];
}

function storeStocks(stocks) {
  localStorage.setItem("stocks", JSON.stringify(stocks));
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
      .catch(e => {
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
  getStocks
};
