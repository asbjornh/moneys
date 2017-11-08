require("./scss/app.scss");

import React from "react";
import { render } from "react-dom";

import Main from "./components/main";

window.onload = function() {
  render(<Main />, document.getElementById("app"));
};
