import React from "react";
import PropTypes from "prop-types";

import { Line } from "react-chartjs-2";

import api from "../../js/api-helper";
import colors from "../../data/colors.json";
import graphUtils from "./graph-utils";
import months from "../../data/months.json";
import utils from "../../js/utils";

class Graph extends React.Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number
  };

  state = {
    points: api.getGraphPoints(),
    showGraph: true
  };

  componentWillReceiveProps() {
    // Unmount and mount graph again to force repaint
    this.setState({ showGraph: false }, () => {
      this.setState({ showGraph: true });
    });
  }

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
    gradient.addColorStop(Math.max(0, mid - 0.1), colors.green);
    gradient.addColorStop(Math.max(0, Math.min(1, mid)), colors.orange);
    gradient.addColorStop(Math.min(1, mid + 0.1), colors.red);
    return gradient;
  };

  render() {
    const graphPadding = 30;
    return !this.state.showGraph || this.state.points.length < 2
      ? null
      : (() => {
          const data = canvas => {
            return {
              datasets: [
                {
                  data: this.state.points,
                  borderColor: this.getGradient(
                    canvas,
                    this.state.points,
                    graphPadding
                  )
                }
              ],
              labels: this.state.points.map(p => {
                const date = new Date(p.x);
                return `${date.getDate()} ${months[date.getMonth()]}`;
              })
            };
          };

          const { width } = this.props;
          const height = this.props.height;

          return (
            <div>
              <Line
                data={data}
                width={width}
                height={height}
                options={graphUtils.getOptions(
                  this.state.points,
                  graphPadding,
                  height
                )}
                ref={l => (this.chart = l)}
              />
            </div>
          );
        })();
  }
}

export default Graph;
