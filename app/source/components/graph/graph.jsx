import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";
import { Line } from "react-chartjs-2";

import colors from "../../data/colors.json";
import css from "./graph.module.scss";
import graphUtils from "./graph-utils";
import months from "../../data/months.json";
import utils from "../../js/utils";
import storage from "../../js/storage-helper";

import GraphFilters from "./graph-filters";

class Graph extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    data: PropTypes.array,
    labels: PropTypes.object,
    height: PropTypes.number,
    width: PropTypes.number
  };

  static defaultProps = {
    data: []
  };

  state = {
    daysToShow: storage.getUserSetting("graphInitialDaysToShow"),
    showGraph: true
  };

  componentWillReceiveProps() {
    // Unmount and mount graph again to force repaint
    this.setState({ showGraph: false }, () => {
      this.setState({ showGraph: true });
    });
  }

  componentWillUnmount() {
    clearInterval(this.updateLoop);
  }

  setDaysToShow = daysToShow => {
    storage.setUserSetting("graphInitialDaysToShow", daysToShow);
    this.setState({ daysToShow });
  };

  getPointRadius = points => {
    const visibleRadius = 3;

    return points.map((point, index) => {
      if (index === 0 || index === points.length - 1) {
        return visibleRadius;
      } else {
        return 0;
      }
    });
  };

  getGradient = (canvas, points, padding) => {
    if (!points || !points.length) return "white";

    const max = Math.max(...points.map(p => p.y));
    const min = Math.min(...points.map(p => p.y));
    const mid = utils.rangeMap(0, min, max, 1, 0);

    if (max < 0) return colors.red;
    if (min > 0) return colors.green;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(
      0,
      padding,
      0,
      canvas.offsetHeight - padding
    );

    gradient.addColorStop(Math.max(0, mid - 0.35), colors.green);
    gradient.addColorStop(utils.clamp(mid, 0, 1), colors.orange);
    gradient.addColorStop(Math.min(1, mid + 0.35), colors.red);

    return gradient;
  };

  render() {
    const graphPadding = 10;

    // Filter points according to the selected filter
    const points = this.props.data.filter(point => {
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
      <div className={cn(css.graph, this.props.className)}>
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
                    return `${date.getDate()}. ${months[date.getMonth()]}`;
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
