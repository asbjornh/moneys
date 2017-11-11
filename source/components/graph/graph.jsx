import React from "react";
import PropTypes from "prop-types";

import { Line } from "react-chartjs-2";

import api from "../../js/api-helper";
import css from "./graph.module.scss";
import graphUtils from "./graph-utils";
import months from "../../data/months.json";

class Graph extends React.Component {
  static propTypes = {
    width: PropTypes.number
  };

  state = {
    points: api.getGraphPoints(),
    showGraph: true
  };

  componentWillReceiveProps() {
    this.setState({ showGraph: false }, () => {
      this.setState({ showGraph: true });
    });
    // console.log(this.chart.chart_instance);
    // this.chart.chart_instance.update();
    // this.chart.chart_instance.render();
  }

  componentDidUpdate() {}

  componentDidMount() {
    this.drawGradient();
  }

  drawGradient = () => {
    const canvas = this.chart.chart_instance.canvas;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.globalCompositeOperation = "source-in";
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#69e697");
    gradient.addColorStop(1, "#ff6874");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  render() {
    const data = {
      datasets: [{ data: this.state.points }],
      labels: this.state.points.map(p => {
        const date = new Date(p.x);
        return `${date.getDate()} ${months[date.getMonth()]}`;
      })
    };

    return !this.state.showGraph ? null : (
      <Line
        className={css.graph}
        data={data}
        width={this.props.width}
        options={graphUtils.getOptions()}
        ref={l => (this.chart = l)}
      />
    );
  }
}

export default Graph;
