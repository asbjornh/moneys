import Chart from "chart.js";
import merge from "lodash/merge";

function getOptions(points) {
  const i = Infinity;
  const max = points.reduce((accum, p) => (p.y > accum ? p.y : accum), -i);
  const min = points.reduce((accum, p) => (p.y < accum ? p.y : accum), i);

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
        bottom: 4,
        left: 5,
        right: 30,
        top: 4
      }
    },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: false,
    scales: {
      xAxes: [{ display: false }],
      yAxes: [
        {
          display: false,
          ticks: { min, max }
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
