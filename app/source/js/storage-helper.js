import { arrayMove } from "react-sortable-hoc";
import get from "lodash/get";

import settings from "../../settings";
import utils from "../js/utils";

function getGraphPoints() {
  return JSON.parse(localStorage.getItem("graphData")) || [];
}

function getStoredData(key, defaultValue) {
  const data = JSON.parse(localStorage.getItem(key));

  return data || defaultValue;
}

function storeData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function addGraphPoint(sum = 0) {
  const points = JSON.parse(localStorage.getItem("graphData")) || [];
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
    localStorage.setItem("graphData", JSON.stringify(points));
  }
}

function getUserStocks() {
  return JSON.parse(localStorage.getItem("userStocks")) || [];
}

function setUserStocks(stocks) {
  localStorage.setItem("userStocks", JSON.stringify(stocks));
}

function sortUserStocks({ oldIndex, newIndex }) {
  const userStocks = getUserStocks();
  const stocks = get(getStoredData("stocks"), "data", []);
  const sortedUserStocks = arrayMove(userStocks, oldIndex, newIndex);
  const sortedStocks = arrayMove(stocks, oldIndex, newIndex);

  if (sortedUserStocks.length) {
    setUserStocks(sortedUserStocks);
  }

  if (sortedStocks.length) {
    storeData("stocks", sortedStocks);
  }
}

function getUserSetting(setting) {
  const userSettings = JSON.parse(localStorage.getItem("userSettings"));
  return get(userSettings, setting, settings.userDefaults[setting]);
}

function setUserSetting(setting, value) {
  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || {};
  userSettings[setting] = value;
  localStorage.setItem("userSettings", JSON.stringify(userSettings));
}

function getBackupData() {
  return JSON.stringify(
    {
      userStocks: JSON.parse(localStorage.getItem("userStocks")),
      userSettings: JSON.parse(localStorage.getItem("userSettings")),
      graphData: JSON.parse(localStorage.getItem("graphData"))
    },
    null,
    2
  );
}

function insertBackupData(data, callback) {
  const { userStocks, userSettings, graphData } = utils.tryParseJSON(data);

  if (userStocks && graphData) {
    localStorage.setItem("userStocks", JSON.stringify(userStocks));
    localStorage.setItem("userSettings", JSON.stringify(userSettings));
    localStorage.setItem("graphData", JSON.stringify(graphData));

    callback(true);
  } else {
    callback(false);
  }
}

function deleteAllData() {
  localStorage.clear();
  window.location.reload();
}

export default {
  addGraphPoint,
  deleteAllData,
  getBackupData,
  getGraphPoints,
  getStoredData,
  getUserStocks,
  getUserSetting,
  insertBackupData,
  setUserStocks,
  setUserSetting,
  sortUserStocks,
  storeData
};
