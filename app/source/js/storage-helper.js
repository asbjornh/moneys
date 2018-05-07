import { arrayMove } from "react-sortable-hoc";
import get from "lodash/get";

import settings from "../../settings";
import utils from "../js/utils";

import storage from "./storage-provider";

function getExchangeRates() {
  return storage.getItem("exchangeRates");
}

function getGraphPoints() {
  return storage.getItem("graphData", []);
}

function getStocks() {
  return storage.getItem("stocks", []);
}

function getUserSetting(key) {
  const userSettings = storage.getItem("userSettings", {});
  return get(userSettings, key, settings.userDefaults[key]);
}

function getUserStocks() {
  // return storage.getItem("userStocks", []);
  return Promise.resolve([
    {
      id: "1511477137213",
      symbol: "SPY5.L",
      qty: 5,
      purchasePrice: 10842,
      purchaseRate: 265.2
    },
    {
      id: "1515613274657",
      intermediateCurrency: "EUR",
      purchasePrice: 1064,
      purchaseRate: 11283,
      qty: 0.01,
      symbol: "BTC",
      type: "currency"
    },
    {
      id: "1515613226697",
      intermediateCurrency: "EUR",
      purchasePrice: 4000,
      purchaseRate: 215.06,
      qty: 1.8583,
      symbol: "LTC",
      type: "currency"
    }
  ]);
}

function setExchangeRates(exchangeRates) {
  storage.setItem("exchangeRates", exchangeRates);
}

function setStocks(stocks) {
  storage.setItem("stocks", stocks);
}

function setUserStocks(stocks) {
  storage.setItem("userStocks", stocks);
}

function setUserSetting(key, value) {
  const userSettings = storage.getItem("userSettings", {});
  userSettings[key] = value;
  storage.setItem("userSettings", userSettings);
}

function addGraphPoint(sum = 0) {
  const points = getGraphPoints();
  const lastPoint = points[points.length - 1];
  const newPoint = {
    x: new Date(new Date().toDateString()).getTime(),
    y: parseFloat(sum.toFixed(2))
  };

  if (
    lastPoint &&
    new Date().getTime() - lastPoint.x < settings.graph.pointInterval
  ) {
    // Last point is newer than 24 hours. Update point
    points[points.length - 1] = Object.assign({}, newPoint);
  } else {
    // Last point is older than 24 hours or does not exist. Add new point
    points.push(newPoint);
  }

  if (sum) {
    storage.setItem("graphData", points);
  }
}

function sortUserStocks({ oldIndex, newIndex }) {
  const userStocks = getUserStocks();
  const stocks = get(storage.getItem("stocks", {}), "data", []);
  const sortedUserStocks = arrayMove(userStocks, oldIndex, newIndex);
  const sortedStocks = arrayMove(stocks, oldIndex, newIndex);

  if (sortedUserStocks.length) {
    setUserStocks(sortedUserStocks);
  }

  if (sortedStocks.length) {
    storage.setItem("stocks", sortedStocks);
  }
}

function getBackupData() {
  return Promise.all([
    storage.getItem("userStocks"),
    storage.getItem("userSettings"),
    storage.getItem("graphData")
  ]).then(([userStocks, userSettings, graphData]) =>
    JSON.stringify({ userStocks, userSettings, graphData }, null, 2)
  );
}

function insertBackupData(data) {
  const { userStocks, userSettings, graphData } = utils.tryParseJSON(data);

  if (userStocks && graphData) {
    return Promise.all([
      storage.setItem("userStocks", userStocks),
      storage.setItem("userSettings", userSettings),
      storage.setItem("graphData", graphData)
    ]);
  } else {
    return Promise.reject();
  }
}

function deleteAllData() {
  storage.clear().then(() => {
    window.location.reload();
  });
}

export default {
  addGraphPoint,
  deleteAllData,
  getExchangeRates,
  getBackupData,
  getGraphPoints,
  getStocks,
  getUserStocks,
  getUserSetting,
  insertBackupData,
  setExchangeRates,
  setStocks,
  setUserStocks,
  setUserSetting,
  sortUserStocks
};
