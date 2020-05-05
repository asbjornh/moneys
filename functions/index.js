const admin = require("firebase-admin");
const functions = require("firebase-functions");

const crypto = require("./crypto");
const exchangeRates = require("./exchange-rates");
const stock = require("./stock");

admin.initializeApp();

function getTickerData(type, tickerName) {
  const getter = type === "currency" ? crypto.get : stock.get;

  return getter(tickerName).then(data => ({ tickerName, data }));
}

exports.updateTickers = functions.https.onCall(() =>
  admin
    .database()
    .ref("/tickers")
    .once("value")
    .then(snapshot => {
      const tickers = snapshot.val();

      return Promise.all(
        Object.keys(tickers).map(tickerName =>
          getTickerData(tickers[tickerName].type, tickerName)
        )
      );
    })
    .then(tickersData =>
      Promise.all(
        tickersData.map(
          ({ tickerName, data }) =>
            new Promise((resolve, reject) => {
              admin
                .database()
                .ref(`/tickers/${tickerName}`)
                .update(data, err => (err ? reject(err) : resolve()));
            })
        )
      )
    )
    .then(() => ({ success: true }))
    .catch(e => {
      console.error(e);
      return { success: false };
    })
);

exports.updateExchangeRates = functions.https.onCall(() =>
  exchangeRates
    .get()
    .then(
      exchangeRates =>
        new Promise((resolve, reject) => {
          admin
            .database()
            .ref("/exchangeRates")
            .update(exchangeRates, err => (err ? reject(err) : resolve()));
        })
    )
    .then(() => ({ success: true }))
    .catch(e => {
      console.error(e);
      return { success: false };
    })
);

exports.add = functions.https.onCall(({ type, ticker, currency }) => {
  if (type === "currency" && ticker && currency) {
    return crypto.add(ticker, currency);
  } else if (ticker) {
    return stock.add(ticker);
  } else {
    return { success: false };
  }
});

exports.delete = functions.https.onCall(({ type, ticker, currency }) => {
  const tickerToRemove =
    type === "currency" ? `${ticker}-${currency}` : stock.encodeTicker(ticker);

  return new Promise(resolve => {
    admin
      .database()
      .ref(`/tickers/${tickerToRemove}`)
      .remove(() => {
        resolve({ success: true });
      });
  });
});
