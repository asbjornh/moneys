const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const functions = require("firebase-functions");

const crypto = require("./crypto");
const exchangeRates = require("./exchange-rates");
const stock = require("./stock");

admin.initializeApp(functions.config().firebase);

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

exports.add = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const body = JSON.parse(req.body);
    const currency = body.currency;
    const ticker = body.ticker;
    const type = body.type;

    if (type === "currency" && ticker && currency) {
      crypto
        .add(ticker, currency)
        .then(success =>
          res.status(success ? 200 : 500).send(success ? "success" : "fail")
        )
        .catch(e => {
          console.error(e);
          res.status(500).send(e);
        });
    } else if (ticker) {
      stock
        .add(ticker)
        .then(success =>
          res.status(success ? 200 : 500).send(success ? "success" : "fail")
        )
        .catch(e => {
          console.error(e);
          res.status(500).send(e);
        });
    } else {
      res.status(500).send("missing data");
    }
  });
});

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
