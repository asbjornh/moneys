import api from "./api-helper";

function sumAndConvert(array, outputCurrency = "NOK") {
  return new Promise((resolve, reject) => {
    api.getCurrencies().then(currencies => {
      const partialSums = array
        .reduce((accum, { currency }) => {
          // Create array of unique currency names
          return accum.indexOf(currency) === -1
            ? accum.concat(currency)
            : accum;
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
          console.log(
            `${amount} ${currency} is ${amount /
              currencies.rates[currency]} ${currencies.base}`
          );
          return accum + amount / currencies.rates[currency];
        }, 0);

      console.log(currencies);
      console.log(partialSums);

      resolve(partialSums);
    });
  });
}

export default {
  sumAndConvert
};
