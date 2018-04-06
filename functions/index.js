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

exports.updateTickers = functions.https.onRequest((req, res) => {
  const type = req.query.type;

  if (!type) {
    res.status(500).send("Bad request");
  } else {
    admin
      .database()
      .ref("/tickers")
      .orderByChild("type")
      .equalTo(type)
      .once("value")
      .then(snapshot => {
        const tickers = snapshot.val();

        return Promise.all(
          Object.keys(tickers).map(tickerName =>
            getTickerData(tickers[tickerName].type, tickerName)
          )
        );
      })
      .then(tickersData => {
        return Promise.all(
          tickersData.map(({ tickerName, data }) => {
            return new Promise(resolve => {
              admin
                .database()
                .ref(`/tickers/${tickerName}`)
                .update(data, e => {
                  if (e) {
                    throw new Error(e);
                  } else {
                    resolve();
                  }
                });
            });
          })
        );
      })
      .then(() => res.status(200).send("finished"))
      .catch(e => {
        console.error(e);
        res.status(500).send("fail");
      });
  }
});

exports.updateExchangeRates = functions.https.onRequest((req, res) => {
  exchangeRates
    .get()
    .then(
      exchangeRates =>
        new Promise((resolve, reject) => {
          admin
            .database()
            .ref("/exchangeRates")
            .update(exchangeRates, e => {
              if (e) {
                reject(e);
              } else {
                resolve();
              }
            });
        })
    )
    .then(() => res.status(200).send("finished"))
    .catch(e => {
      console.error(e);
      res.status(500).send("fail");
    });
});

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
