import Chart from "chart.js";
import merge from "lodash/merge";

function getOptions() {
  return merge(Chart.defaults.global, {
    animation: {
      duration: 0
    },
    elements: {
      point: {
        backgroundColor: "white"
      },
      line: {
        borderColor: "white",
        borderWidth: window.devicePixelRatio * 2,
        backgroundColor: "transparent"
      }
    },
    layout: {
      padding: {
        top: 0,
        left: 5,
        right: 20
      }
    },
    legend: { display: false },
    responsive: false, // Don't let Chart.js handle dimensions. It gets messy
    devicePixelRatio: 1, // Don't let Chart.js handle this either
    scales: {
      xAxes: [{ display: false }],
      yAxes: [
        {
          display: false
        }
      ]
    }
  });
}

export default {
  getOptions
};
