const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const functions = require("firebase-functions");

const crypto = require("./crypto");
const exchangeRates = require("./exchange-rates");
const stock = require("./stock");

admin.initializeApp(functions.config().firebase);

exports.delete = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const body = JSON.parse(req.body);
    const currency = body.currency;
    const ticker = body.ticker;
    const type = body.type;
    const tickerToRemove =
      type === "currency"
        ? `${ticker}-${currency}`
        : stock.encodeTicker(ticker);

    admin
      .database()
      .ref(`/tickers/${tickerToRemove}`)
      .remove(() => {
        res.status(200).send("success");
      });
  });
});

exports.update = functions.https.onRequest((req, res) => {
  admin
    .database()
    .ref("/tickers")
    .once("value")
    .then(snapshot => {
      const tickers = snapshot.val();

      return Promise.all(
        Object.keys(tickers).forEach(tickerName => {
          return new Promise((resolve, reject) => {
            const getter =
              tickers[tickerName].type === "currency" ? crypto.get : stock.get;

            getter(tickerName)
              .then(data => {
                admin
                  .database()
                  .ref(`/tickers/${tickerName}`)
                  .update(data, e => {
                    if (e) {
                      reject(e);
                    } else {
                      resolve();
                    }
                  });
              })
              .catch(e => {
                reject("Failed to get " + tickerName);
                console.error("get stock", e);
              });
          });
        })
      ).catch(e => {
        console.error("catch all", e);
      });
    })
    .then(() => exchangeRates.get())
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
    .then(() => {
      res.status(200).send("finished");
    })
    .catch(e => {
      console.error(e);
      res.status(500).send("fail");
    });
});

exports.add = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const body = JSON.parse(req.body);
    const currency = body.currency;
    const ticker = body.ticker;
    const type = body.type;

    if (type === "currency" && ticker && currency) {
      crypto
        .add(ticker, currency)
        .then(success => {
          res.status(success ? 200 : 500).send(success ? "success" : "fail");
        })
        .catch(e => {
          console.error(e);
          res.status(500).send(e);
        });
    } else if (ticker) {
      stock
        .add(ticker)
        .then(success => {
          res.status(success ? 200 : 500).send(success ? "success" : "fail");
        })
        .catch(e => {
          console.error(e);
          res.status(500).send(e);
        });
    } else {
      res.status(500).send("missing data");
    }
  });
});
