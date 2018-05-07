import { AsyncStorage, Platform } from "react-native";

const webStorage = {
  clear: () =>
    new Promise(res => {
      localStorage.clear();
      return res();
    }),
  getItem: (key, defaultValue) =>
    new Promise(res => {
      try {
        return res(localStorage.getItem(key));
      } catch (e) {
        return res(defaultValue);
      }
    }),
  setItem: (key, data) =>
    new Promise((res, rej) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return res();
      } catch (e) {
        return rej(e);
      }
    })
};

const nativeStorage = {
  clear: () =>
    AsyncStorage.multiRemove([
      "exchangeRates",
      "graphData",
      "stocks",
      "userSettings",
      "userStocks"
    ]),
  getItem: (key, defaultValue) =>
    AsyncStorage.getItem(key)
      .then(JSON.stringify)
      .catch(() => defaultValue),
  setItem: (key, data) => AsyncStorage.setItem(key, JSON.stringify(data))
};

const storage = Platform.OS === "web" ? webStorage : nativeStorage;

export default storage;
