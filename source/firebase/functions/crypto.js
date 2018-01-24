const fetch = require("node-fetch");
const admin = require("firebase-admin");

function getCrypto(currencyPair) {
  return fetch(`https://api.coinbase.com/v2/prices/${currencyPair}/sell`)
    .then(res => res.json())
    .then(json => {
      if (json.data) {
        return {
          currency: json.data.currency,
          lastUpdated: new Date().getTime(),
          price: parseFloat(json.data.amount)
        };
      } else {
        throw new Error("Bad response");
      }
    });
}

function add(ticker, currency) {
  return new Promise((resolve, reject) => {
    admin
      .database()
      .ref("/cryptoNames")
      .once("value")
      .then(snapshot => {
        const cryptoNames = snapshot.val();

        // If ticker doesn't exist in cryptoNames, it isn't supported
        if (cryptoNames[ticker]) {
          return getCrypto(`${ticker}-${currency}`)
            .then(data => {
              return Object.assign({}, data, {
                longName: cryptoNames[ticker],
                type: "currency"
              });
            })
            .catch(() => {
              reject("Crypto not found");
            });
        } else {
          reject("Crypto not supported");
        }
      })
      .then(newCryptoData => {
        const tickerName = `${ticker}-${currency}`;

        admin
          .database()
          .ref(`/tickers/${tickerName}`)
          .update(newCryptoData, e => {
            resolve({ success: !!e });
          });
      })
      .catch(() => {
        reject("Couldn't connect to database");
      });
  });
}

exports.get = getCrypto;
exports.add = add;
