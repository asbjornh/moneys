import Chart from "chart.js";
import merge from "lodash/merge";

function getOptions(points, padding, height) {
  const i = Infinity;
  const maxY = points.reduce((accum, p) => (p.y > accum ? p.y : accum), -i);
  const minY = points.reduce((accum, p) => (p.y < accum ? p.y : accum), i);
  const maxX = points.reduce((accum, p) => (p.x > accum ? p.x : accum), -i);
  const minX = points.reduce((accum, p) => (p.x < accum ? p.x : accum), i);
  // Convert padding in pixels to padding in graph value:
  const graphPadding =
    padding * window.devicePixelRatio * (maxY - minY) / height;

  return merge(Chart.defaults.global, {
    animation: {
      duration: 0
    },
    elements: {
      point: {
        backgroundColor: "white",
        hitRadius: 4
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
      xAxes: [
        {
          display: false,
          type: "linear",
          ticks: { min: minX, max: maxX }
        }
      ],
      yAxes: [
        {
          display: false,
          ticks: {
            min: minY - graphPadding,
            max: maxY + graphPadding
          }
        }
      ]
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        title: (tooltipItem, data) => {
          return data.labels[tooltipItem[0].index];
        }
      }
    }
  });
}

export default {
  getOptions
};
