function convert(value, fromCurrency, toCurrency, currencies) {
  const baseValue = value / currencies.rates[fromCurrency]; // convert to base value
  return baseValue * currencies.rates[toCurrency]; // convert to output currency
}

function sumAndConvert(stocks, currencies, outputCurrency = "NOK") {
  return stocks.reduce((accum, stock) => {
    const currentPrice = stock.price * stock.qty;
    const convertedCurrentPrice = convert(
      currentPrice,
      stock.currency,
      outputCurrency,
      currencies
    );
    const difference = convertedCurrentPrice - stock.purchasePrice;

    return accum + difference;
  }, 0);
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
  convert,
  formatNumber,
  rangeMap,
  sumAndConvert
};
