// Converts minutes to milliseconds
function minutesToMs(minutes) {
  return minutes * 60 * 1000;
}

// Converts hours to milliseconds
function hoursToMs(hours) {
  return minutesToMs(hours * 60);
}

function inRange(val, min, max) {
  return val >= min && val <= max;
}

function stockIsOutdated(lastUpdated) {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // Sunday is 0

  if (inRange(day, 0, 1) || !inRange(hour, 8, 18)) {
    return false;
  } else {
    return new Date().getTime - lastUpdated > hoursToMs(1) + minutesToMs(1);
  }
}

function currencyIsOutdated(lastUpdated) {
  const hour = new Date().getHours();
  const time = new Date().getTime();

  if (inRange(hour, 2, 5)) {
    return false;
  } else if (inRange(hour, 0, 6) || hour >= 23) {
    return time - lastUpdated > hoursToMs(1) + minutesToMs(1);
  } else if (!inRange(hour, 9, 18)) {
    return time - lastUpdated > minutesToMs(31);
  } else {
    return time - lastUpdated > minutesToMs(11);
  }
}

function convert(value, fromCurrency, toCurrency, exchangeRates) {
  const baseValue = value / exchangeRates[fromCurrency]; // convert to base value
  return baseValue * exchangeRates[toCurrency]; // convert to output currency
}

function sumAndConvert(stocks, exchangeRates, outputCurrency = "NOK") {
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
          exchangeRates
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
      return accum.concat(
        index !== 0 && index % 3 === 0 ? [" ", number] : number
      );
    }, [])
    .reverse()
    .join("");
}

function formatNumber(number, displaySymbol, numberOfDecimals) {
  if (isNaN(number)) return 0;
  const hasNumberOfDecimals = typeof numberOfDecimals !== "undefined";
  const symbol = number > 0 ? "+" : number < 0 ? "-" : "";
  const absolute = Math.abs(number);
  let formattedNumber = "";

  if (absolute < 1000) {
    if (parseInt(absolute) === absolute) {
      formattedNumber = absolute;
    } else if (absolute < 100) {
      formattedNumber = absolute.toFixed(
        hasNumberOfDecimals ? numberOfDecimals : 2
      );
    } else {
      formattedNumber = absolute.toFixed(
        hasNumberOfDecimals ? numberOfDecimals : 1
      );
    }
  } else if (absolute < 100000) {
    formattedNumber = formatNumberWithSpaces(absolute);
  } else if (absolute < 1000000) {
    formattedNumber = (absolute / 1000).toFixed(1) + "k";
  } else {
    formattedNumber = (absolute / 1000000).toFixed(3) + "M";
  }

  return (displaySymbol ? symbol : "") + formattedNumber;
}

function rangeMap(value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default {
  clamp,
  convert,
  currencyIsOutdated,
  formatNumber,
  hoursToMs,
  minutesToMs,
  rangeMap,
  stockIsOutdated,
  sumAndConvert
};
