function sumAndConvert(stocks, currencies, outputCurrency = "NOK") {
  if (!stocks || !stocks.length || !currencies) return 0;

  const values = stocks.map(stock => {
    return {
      amount: (stock.price - stock.purchasePrice) * stock.qty,
      currency: stock.currency
    };
  });

  const baseSum = values
    .reduce((accum, { currency }) => {
      // Create array of unique currency names
      return accum.indexOf(currency) === -1 ? accum.concat(currency) : accum;
    }, [])
    .reduce((accum, currency) => {
      // Create array of partial sums per currency
      return accum.concat({
        currency,
        amount: values
          .filter(value => value.currency === currency) // get all values of same currency
          .reduce((accum, value) => accum + value.amount, 0) // sum
      });
    }, [])
    .reduce((accum, { amount, currency }) => {
      return accum + amount / currencies.rates[currency];
    }, 0);

  return baseSum * currencies.rates[outputCurrency];
}

function formatNumber(number, numberOfDecimals) {
  if (isNaN(number)) return 0;
  const symbol = number > 0 ? "+" : "";

  if (number < 10000) {
    return symbol + number.toFixed(numberOfDecimals);
  } else if (number < 100000) {
    return `${symbol}${(number / 1000).toFixed(2)}k`;
  } else if (number < 1000000) {
    return `${symbol}${(number / 1000).toFixed(1)}k`;
  } else {
    return `${symbol}${(number / 1000000).toFixed(3)}M`;
  }
}

function rangeMap(value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export default {
  formatNumber,
  rangeMap,
  sumAndConvert
};
