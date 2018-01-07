// Converts minutes to milliseconds
function minutes(minutes) {
  return minutes * 60 * 1000;
}

// Converts hours to milliseconds
function hours(hours) {
  return minutes(hours * 60);
}

const intermediateCurrencies = ["EUR", "NOK", "SEK", "USD"];

export default {
  updateInterval: minutes(10),
  graph: {
    pointInterval: hours(24)
  },
  intermediateCurrencies,
  storage: {
    maxAge: minutes(9)
  }
};
