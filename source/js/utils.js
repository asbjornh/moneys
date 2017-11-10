function sumAndConvert(array, currencies, outputCurrency) {
  if (!array || !currencies || !outputCurrency) return false;

  const baseSum = array
    .reduce((accum, { currency }) => {
      // Create array of unique currency names
      return accum.indexOf(currency) === -1 ? accum.concat(currency) : accum;
    }, [])
    .reduce((accum, currency) => {
      // Create array of partial sums per currency
      return accum.concat({
        currency,
        amount: array
          .filter(value => value.currency === currency) // get all values of same currency
          .reduce((accum, value) => accum + value.amount, 0) // sum
      });
    }, [])
    .reduce((accum, { amount, currency }) => {
      return accum + amount / currencies.rates[currency];
    }, 0);

  return baseSum * currencies.rates[outputCurrency];
}

export default {
  sumAndConvert
};
