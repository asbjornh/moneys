import React from "react";
import PropTypes from "prop-types";

import { Animated, View, Platform } from "react-native";

import utils from "../../js/utils";

class Stock extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    isEnabled: PropTypes.bool,
    maxDistance: PropTypes.number
  };

  static defaultProps = {
    isEnabled: true,
    maxDistance: 100
  };

  state = {
    isAnimating: false,
    slideProgress: 0,
    slideProgressAnimated: new Animated.Value(0)
  };

  hasTouchStart = false;

  moveTo = getPosition => {
    this.setState(state => {
      const position = getPosition(state.slideProgress);
      const slideProgress = utils.clamp(position, 0, 1);

      Animated.spring(state.slideProgressAnimated, {
        toValue: slideProgress
      }).start(this.onRest);

      return {
        isAnimating: position !== state.slideProgress,
        slideProgress
      };
    });
  };

  handleTouchStart = (x, y) => {
    this.hasTouchStart = true;

    if (this.props.isEnabled) {
      this.lastTouchX = x;
      this.lastTouchY = y;
    }
  };

  handleTouchMove = (x, y) => {
    if (this.props.isEnabled) {
      if (Math.abs(x - this.lastTouchX) > Math.abs(y - this.lastTouchY)) {
        const deltaX = (this.lastTouchX - x) / this.props.maxDistance;

        this.moveTo(slideProgress => slideProgress + deltaX);
      }

      this.lastTouchX = x;
      this.lastTouchY = y;
    }
  };

  handleTouchEnd = () => {
    setTimeout(() => {
      this.hasTouchStart = false;
    }, 20);

    this.moveTo(Math.round);
  };

  onTouchStart = e => {
    this.handleTouchStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  onResponderGrant = e => {
    this.handleTouchStart(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };

  onTouchMove = e => {
    this.handleTouchMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  onResponderMove = e => {
    this.handleTouchMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };

  onMouseEnter = () => {
    if (!this.hasTouchStart) {
      this.moveTo(() => 1);
    }
  };

  onMouseLeave = () => {
    this.moveTo(() => 0);
  };

  onRest = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({ isAnimating: false });
    }, 32);
  };

  render() {
    const viewProps =
      Platform.OS === "web"
        ? {
            onMouseEnter: this.onMouseEnter,
            onMouseLeave: this.onMouseLeave,
            onTouchStart: this.onTouchStart,
            onTouchMove: this.onTouchMove,
            onTouchEnd: this.handleTouchEnd
          }
        : {
            onStartShouldSetResponder: () => true,
            onMoveShouldSetResponder: () => true,
            onResponderTerminationRequest: () => false,
            onResponderGrant: this.onResponderGrant,
            onResponderMove: this.onResponderMove,
            onResponderRelease: this.handleTouchEnd
          };

    return (
      <View {...viewProps} style={{ position: "relative" }}>
        {this.props.children({
          isAnimating: this.state.isAnimating,
          slideProgress: this.state.slideProgressAnimated
        })}
      </View>
    );
  }
}

export default Stock;
