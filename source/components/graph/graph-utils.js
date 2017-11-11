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
        left: 5,
        right: 30
      }
    },
    legend: { display: false },
    scales: {
      xAxes: [{ display: false }],
      yAxes: [
        {
          display: false
        }
      ]
    },
    tooltips: {
      displayColors: false
    }
  });
}

export default {
  getOptions
};
