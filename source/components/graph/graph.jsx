import React from "react";
import PropTypes from "prop-types";

import { Line } from "react-chartjs-2";

import api from "../../js/api-helper";
import colors from "../../data/colors.json";
import css from "./graph.module.scss";
import graphUtils from "./graph-utils";
import months from "../../data/months.json";
import utils from "../../js/utils";

import GraphFilters from "./graph-filters";

class Graph extends React.Component {
  static propTypes = {
    labels: PropTypes.object,
    height: PropTypes.number,
    width: PropTypes.number
  };

  state = {
    daysToShow: 7,
    points: api.getGraphPoints(),
    showGraph: true
  };

  componentWillReceiveProps() {
    // Unmount and mount graph again to force repaint
    this.setState({ showGraph: false }, () => {
      this.setState({ showGraph: true });
    });
  }

  setDaysToShow = daysToShow => {
    this.setState({ daysToShow });
  };

  getPointRadius = (points, canvas) => {
    const visibleRadius = 3;
    const maxPoints = Math.round(0.15 * canvas.width / visibleRadius);
    const skipInterval = 1 + Math.floor(points.length / maxPoints);

    return points.map((point, index) => {
      if (index === 0 || index === points.length - 1) {
        return visibleRadius;
      } else if (index % skipInterval === 0) {
        return index > skipInterval && index + skipInterval < points.length - 1
          ? visibleRadius
          : 0;
      } else {
        return 0;
      }
    });
  };

  getGradient = (canvas, points, padding) => {
    if (!points || !points.length) return "white";

    const i = Infinity;
    const max = points.reduce((accum, p) => (p.y > accum ? p.y : accum), -i);
    const min = points.reduce((accum, p) => (p.y < accum ? p.y : accum), i);
    const mid = utils.rangeMap(0, min, max, 1, 0);

    if (max < 0) return colors.red;
    if (min > 0) return colors.green;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(
      0,
      padding,
      0,
      canvas.height - padding
    );
    gradient.addColorStop(Math.max(0, mid - 0.2), colors.green);
    gradient.addColorStop(Math.max(0, Math.min(1, mid)), colors.orange);
    gradient.addColorStop(Math.min(1, mid + 0.2), colors.red);
    return gradient;
  };

  render() {
    const graphPadding = 30;

    // Filter points according to the selected filter
    const points = this.state.points.filter(point => {
      if (!this.state.daysToShow) {
        return point;
      } else {
        return (
          point.x >
          new Date().getTime() - (this.state.daysToShow + 1) * 24 * 3600 * 1000
        );
      }
    });

    return (
      <div className={css.graph}>
        {!this.state.showGraph ||
          (points.length >= 2 &&
            (() => {
              const data = canvas => {
                return {
                  datasets: [
                    {
                      data: points,
                      borderColor: this.getGradient(
                        canvas,
                        points,
                        graphPadding
                      ),
                      pointRadius: this.getPointRadius(points, canvas)
                    }
                  ],
                  labels: points.map(p => {
                    const date = new Date(p.x);
                    return `${date.getDate()} ${months[date.getMonth()]}`;
                  })
                };
              };

              const { width } = this.props;
              const height = this.props.height;

              return (
                <Line
                  data={data}
                  width={width}
                  height={height}
                  options={graphUtils.getOptions(points, graphPadding, height)}
                  ref={l => (this.chart = l)}
                />
              );
            })())}
        <GraphFilters
          daysToShow={this.state.daysToShow}
          labels={this.props.labels}
          onUpdate={this.setDaysToShow}
        />
      </div>
    );
  }
}

export default Graph;
