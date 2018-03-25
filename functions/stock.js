const admin = require("firebase-admin");
const fetch = require("node-fetch");
const get = require("lodash/get");

// yahoo uses dots in some of their ticker names, which firebase doesn't like. Replace with colon, which doesn't seem to be used by yahoo
function encodeTicker(ticker) {
  return ticker.replace(".", ":");
}

function decodeTicker(ticker) {
  return ticker.replace(":", ".");
}

function getStock(ticker) {
  return fetch(
    `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${decodeTicker(
      ticker
    )}?formatted=false&modules=price`
  )
    .then(res => {
      return res.json();
    })
    .then(json => {
      const stock = get(json, "quoteSummary.result[0].price");

      if (stock) {
        let longName = stock.longName || stock.shortName || ticker;
        longName = longName.replace("&amp;", "&");

        return {
          currency: stock.currency,
          lastUpdated: new Date().getTime(),
          longName: longName,
          price: stock.regularMarketPrice
        };
      } else {
        throw new Error("Bad response");
      }
    });
}

function add(ticker) {
  return new Promise((resolve, reject) => {
    getStock(ticker)
      .then(newStockData => {
        admin
          .database()
          .ref(`/tickers/${encodeTicker(ticker)}`)
          .update(Object.assign({}, newStockData, { type: "stock" }), e => {
            resolve({ success: !!e });
          });
      })
      .catch(e => {
        console.error(e);
        reject("Stock not found");
      });
  });
}

exports.decodeTicker = decodeTicker;
exports.encodeTicker = encodeTicker;
exports.get = getStock;
exports.add = add;
