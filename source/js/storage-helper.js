import settings from "../settings";

function getGraphPoints() {
  return JSON.parse(localStorage.getItem("graphData")) || [];
}

function getStoredData(key) {
  const data = JSON.parse(localStorage.getItem(key));

  const isOutdated =
    data && new Date().getTime() - data.timeStamp > settings.storage.maxAge;
  return Object.assign({}, data, { isOutdated });
}

function storeData(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timeStamp: new Date().getTime()
    })
  );
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

function getShouldConvertStocks() {
  return JSON.parse(localStorage.getItem("shouldConvertStocks"));
}

function setShouldConvertStocks(shouldConvert) {
  localStorage.setItem("shouldConvertStocks", shouldConvert);
}

function getUserStocks() {
  return JSON.parse(localStorage.getItem("userStocks")) || [];
}

function setUserStocks(stocks) {
  localStorage.setItem("userStocks", JSON.stringify(stocks));
}

function getUserCurrency() {
  return localStorage.getItem("userCurrency") || "NOK";
}

function setUserCurrency(currency) {
  localStorage.clear();
  localStorage.setItem("userCurrency", currency);
  window.location.reload();
}

function getUserLanguage() {
  return localStorage.getItem("userLanguage") || "english";
}

function setUserLanguage(language) {
  localStorage.setItem("userLanguage", language);
}

function getBackupData() {
  return JSON.stringify({
    userStocks: JSON.parse(localStorage.getItem("userStocks")),
    graphData: JSON.parse(localStorage.getItem("graphData"))
  });
}

function insertBackupData(data) {
  const newData = JSON.parse(data);

  Object.keys(newData).forEach(key => {
    localStorage.setItem(key, JSON.stringify(newData[key]));
  });

  window.location.reload();
}

export default {
  addGraphPoint,
  getBackupData,
  getGraphPoints,
  getShouldConvertStocks,
  getStoredData,
  getUserCurrency,
  getUserLanguage,
  getUserStocks,
  insertBackupData,
  setShouldConvertStocks,
  setUserCurrency,
  setUserLanguage,
  setUserStocks,
  storeData
};
