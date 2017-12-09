// Converts minutes to milliseconds
function minutes(minutes) {
  return minutes * 60 * 1000;
}

// Converts hours to milliseconds
function hours(hours) {
  return minutes(hours * 60);
}

export default {
  updateInterval: minutes(1),
  graph: {
    pointInterval: hours(24)
  },
  storage: {
    maxAge: minutes(0.9)
  }
};
