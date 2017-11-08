import React from "react";

import { UnmountClosed as Collapse } from "react-collapse";
import FlipMove from "react-flip-move";

import api from "../js/api-helper";

import Form from "./form";
import Stock from "./stock";

class Main extends React.Component {
  state = {
    formIsVisible: false,
    stocks: []
  };

  componentDidMount() {
    api.getStocks().then(stocks => {
      this.setState({ stocks });
    });
  }

  onSubmit = formData => {
    api.addStock(formData).then(stocks => {
      this.setState({ stocks, formIsVisible: false });
    });
  };

  showForm = () => {
    this.setState({ formIsVisible: true });
  };

  deleteStock = id => {
    api.deleteStock(id).then(stocks => {
      this.setState({ stocks });
    });
  };

  render() {
    return (
      <div>
        <Collapse isOpened={!!this.state.stocks.length}>
          <FlipMove
            typeName="table"
            className="stocks"
            duration={500}
            easing="ease-out"
          >
            {this.state.stocks.map(stock => (
              <Stock key={stock.id} onDelete={this.deleteStock} {...stock} />
            ))}
          </FlipMove>
        </Collapse>

        <div className="form-container">
          <Collapse isOpened={this.state.formIsVisible}>
            <Form onSubmit={this.onSubmit} />
          </Collapse>

          <Collapse isOpened={!this.state.formIsVisible}>
            <button
              className="form-button"
              onClick={this.showForm}
              type="button"
            >
              +
            </button>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default Main;
