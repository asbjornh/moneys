import Chart from "chart.js";
import merge from "lodash/merge";

function getOptions(points, padding, height) {
  const maxY = Math.max(...points.map(p => p.y));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const minX = Math.min(...points.map(p => p.x));

  // Convert padding in pixels to padding in graph value:
  const valuePadding = 1 * (maxY - minY) / height;

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
        borderWidth: 2,
        backgroundColor: "transparent"
      }
    },
    layout: {
      padding: {
        left: 5,
        right: 25,
        top: padding,
        bottom: padding
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
            min: minY - valuePadding,
            max: maxY + valuePadding
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
