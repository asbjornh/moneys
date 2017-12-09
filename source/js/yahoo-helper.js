import get from "lodash/get";

function getStockData(responseJson) {
  const data = get(responseJson, "quoteSummary.result[0]");

  if (data) {
    const longName =
      get(data, "price.longName") ||
      get(data, "price.shortName") ||
      get(data, "price.symbol");

    return {
      currency: get(data, "price.currency"),
      currencySymbol: get(data, "price.currencySymbol"),
      longName: longName.replace(/&amp;/g, "&"),
      price: get(data, "price.regularMarketPrice")
    };
  }
}

export default {
  getStockData
};
