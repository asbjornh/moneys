import { red, green } from "../../styles/vars";

export default {
  wrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end"
  },

  number: (fontSize, value) => ({
    fontSize: fontSize,
    alignSelf: "stretch",
    color: value > 0 ? green : value < 0 ? red : "white",
    fontWeight: "bold",
    lineHeight: fontSize,
    textAlign: "right"
  }),

  symbol: (fontSize, isSuperscript) =>
    Object.assign(
      {
        fontSize: fontSize,
        marginLeft: 5
      },
      isSuperscript
        ? {
            fontSize: fontSize * 0.6,
            transform: [{ translateY: -(1 - 0.6) / 2 * fontSize }]
          }
        : {}
    )
};
