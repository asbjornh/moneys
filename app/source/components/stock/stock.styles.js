import { StyleSheet } from "react-native";

import {
  borderColor,
  darkGray,
  fontSize,
  fontSizeLg,
  mediumGray
} from "../../styles/vars";

export default StyleSheet.create({
  stock: {
    position: "relative",
    backgroundColor: darkGray,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: borderColor
  },

  row: {
    position: "relative",
    zIndex: 3,
    flexDirection: "row",
    alignItems: "baseline"
  },

  ticker: {
    color: "white",
    fontSize: fontSizeLg,
    fontWeight: "bold",
    flex: 1
  },

  number: {
    minWidth: 4.2 * fontSizeLg
  },

  percentage: {
    paddingRight: 10,
    marginLeft: "auto",
    flex: 0
  },

  longName: {
    color: mediumGray
  },

  moreStuff: {
    flexDirection: "row",
    marginLeft: "auto"
  },

  moreStuffChild: {
    color: mediumGray,
    fontSize,
    paddingLeft: 20
  },

  buttonContainer: {
    position: "absolute",
    zIndex: 2,
    flex: 1,
    top: 0,
    right: 0,
    width: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20
  },

  sortingHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transform: [{ scale: 0.1 }]
  },

  warning: {
    marginLeft: 10
  }
});
