const fetch = require("node-fetch");

exports.get = function() {
  return fetch("https://api.coinbase.com/v2/exchange-rates")
    .then(res => res.json())
    .then(json => {
      if (json.data) {
        return json.data.rates;
      } else {
        throw new Error("No currency data");
      }
    })
    .catch(e => {
      console.error(e);
      throw new Error(e);
    });
};
