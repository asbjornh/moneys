import get from "lodash/get";
import yahooFinance from "yahoo-finance";

function getStockData({ symbol, purchasePrice, qty }) {
  return new Promise(resolve => {
    yahooFinance.quote(
      {
        symbol: symbol.toUpperCase(),
        modules: ["price"]
      },
      (err, quotes) => {
        resolve({
          currency: get(quotes, "price.currencySymbol"),
          id: symbol + purchasePrice + qty,
          longName: get(quotes, "price.longName").replace(/&amp;/g, "&"),
          price: get(quotes, "price.regularMarketPrice"),
          purchasePrice: parseFloat(purchasePrice),
          qty: parseInt(qty),
          symbol: get(quotes, "price.symbol")
        });
      }
    );
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
  return new Promise(resolve => {
    const storedStocks = getStoredStocks();

    getStockData({ symbol, purchasePrice, qty }).then(enrichedStock => {
      const stocks = storedStocks.concat(enrichedStock);

      storeStocks(stocks);
      resolve(stocks);
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
