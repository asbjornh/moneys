import Chart from "chart.js";
import merge from "lodash/merge";

function getOptions(points, padding, height) {
  const i = Infinity;
  const max = points.reduce((accum, p) => (p.y > accum ? p.y : accum), -i);
  const min = points.reduce((accum, p) => (p.y < accum ? p.y : accum), i);
  // Convert padding in pixels to padding in graph value:
  const graphPadding = padding * window.devicePixelRatio * (max - min) / height;

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
    maintainAspectRatio: false,
    responsive: false,
    scales: {
      xAxes: [{ display: false }],
      yAxes: [
        {
          display: false,
          ticks: {
            min: min - graphPadding,
            max: max + graphPadding
          }
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
