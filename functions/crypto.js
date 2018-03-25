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

function getCryptoWithName(currencyPair, longName) {
  return getCrypto(currencyPair).then(data =>
    Object.assign({}, data, {
      longName: longName,
      type: "currency"
    })
  );
}

function add(ticker, currency) {
  return admin
    .database()
    .ref("/cryptoNames")
    .once("value")
    .then(snapshot => {
      const cryptoNames = snapshot.val();

      // If ticker doesn't exist in cryptoNames, it isn't supported
      if (cryptoNames[ticker]) {
        return getCryptoWithName(`${ticker}-${currency}`, cryptoNames[ticker]);
      } else {
        throw new Error("Crypto not supported");
      }
    })
    .then(newCryptoData => {
      console.log("crypto data", newCryptoData);
      const tickerName = `${ticker}-${currency}`;

      return new Promise(resolve => {
        admin
          .database()
          .ref(`/tickers/${tickerName}`)
          .update(newCryptoData, e => {
            resolve({ success: Boolean(e) });
          });
      });
    })
    .catch(e => {
      console.log(e);
      throw new Error("Couldn't connect to database");
    });
}

exports.get = getCrypto;
exports.add = add;
