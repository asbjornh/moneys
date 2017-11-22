function convert(value, fromCurrency, toCurrency, currencies) {
  const baseValue = value / currencies.rates[fromCurrency]; // convert to base value
  return baseValue * currencies.rates[toCurrency]; // convert to output currency
}

function sumAndConvert(stocks, currencies, outputCurrency = "NOK") {
  const realizedSum = stocks.reduce((accum, stock) => {
    return stock.isRealized
      ? accum + stock.sellPrice - stock.purchasePrice
      : accum;
  }, 0);

  return stocks.reduce(
    (accum, stock) => {
      if (stock.isRealized) {
        return accum;
      } else {
        const currentPrice = stock.price * stock.qty;
        const convertedCurrentPrice = convert(
          currentPrice,
          stock.currency,
          outputCurrency,
          currencies
        );
        const difference = convertedCurrentPrice - stock.purchasePrice;

        return {
          difference: accum.difference + difference,
          total: accum.total + convertedCurrentPrice
        };
      }
    },
    { total: 0, difference: realizedSum }
  );
}

function formatNumberWithSpaces(number) {
  return number
    .toFixed(0)
    .split("")
    .reverse()
    .reduce((accum, number, index) => {
      return accum.concat(index % 3 === 0 ? [" ", number] : number);
    }, [])
    .reverse()
    .join("");
}

function formatNumber(number, numberOfDecimals = 0, displaySymbol = true) {
  if (isNaN(number)) return 0;
  const symbol = number > 0 && displaySymbol ? "+" : "";

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
  formatNumberWithSpaces,
  rangeMap,
  sumAndConvert
};
