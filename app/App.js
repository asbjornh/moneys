/* eslint-disable react/prefer-stateless-function */
import React from "react";
import { StatusBar } from "react-native";

import Main from "./source/components/main";

export default class App extends React.Component {
  render() {
    StatusBar.setBarStyle("light-content", true);
    return <Main />;
  }
}
