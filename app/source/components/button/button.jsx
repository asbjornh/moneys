import React from "react";
import PropTypes from "prop-types";

import { TouchableHighlight, Platform } from "react-native";

const Button = ({ children, onClick, style, title }) =>
  Platform.OS === "web" ? (
    <button style={style} onClick={onClick} title={title} type="button">
      {children}
    </button>
  ) : (
    <TouchableHighlight onPress={onClick} style={style}>
      {children}
    </TouchableHighlight>
  );

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  style: PropTypes.object,
  title: PropTypes.string
};

export default Button;
