import utils from "./source/js/utils";

export default {
  graph: {
    pointInterval: utils.hoursToMs(24)
  },
  intermediateCurrencies: ["EUR", "NOK", "SEK", "USD"],
  userDefaults: {
    currency: "NOK",
    language: "norwegian",
    shouldConvertStocks: false,
    graphInitialDaysToShow: 7
  }
};
