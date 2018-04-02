import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./modal.module.scss";

import Icons from "../icons";
import TabTrapper from "./tab-trapper";

class Modal extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ]).isRequired,
    closeButtonText: PropTypes.string,
    isVisible: PropTypes.bool,
    onCloseClick: PropTypes.func.isRequired // will be triggered by click on close button, modal background or by pressing the esc key
  };

  static defaultProps = {
    closeButtonText: "Lukk"
  };

  state = {};

  componentDidMount() {
    this.modal.addEventListener("keyup", this.handleEscPress);

    this.setState({
      fitsOnScreen: this.modal.offsetHeight < window.innerHeight
    });
  }

  componentWillUnmount() {
    this.modal.removeEventListener("keyup", this.handleEscPress);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isVisible !== this.props.isVisible) {
      if (this.props.isVisible) {
        this.onAfterShowModal();
      }
    }
  }

  onAfterShowModal = () => {
    // Wait one frame before focusing
    requestAnimationFrame(() => {
      this.modal.focus();
      this.modalWrapper.scrollTop = 0;
    });

    this.setState(
      {
        fitsOnScreen: this.modal.offsetHeight < window.innerHeight
      },
      () => {
        this.setState({ contentHeight: this.modalWrapper.scrollHeight });
      }
    );
  };

  handleEscPress = e => {
    if (e.which === 27) {
      this.props.onCloseClick();
    }
  };

  render() {
    const ariaProps = { "aria-modal": true, role: "dialog" };
    const bodyElement = document && document.body;
    return !bodyElement
      ? null
      : ReactDOM.createPortal(
          <div
            className={cn(css.modal, {
              [css.isVisible]: this.props.isVisible,
              [css.fitsOnScreen]: this.state.fitsOnScreen
            })}
            ref={d => (this.modalWrapper = d)}
            {...ariaProps}
          >
            <div
              className={css.modalBackground}
              style={{
                minHeight: this.state.contentHeight
              }}
              onClick={this.props.onCloseClick}
            />

            <div
              className={css.modalContent}
              ref={d => (this.modal = d)}
              tabIndex={-1}
            >
              <TabTrapper isActive={this.props.isVisible}>
                {this.props.children}
                <button
                  className={css.modalClose}
                  onClick={this.props.onCloseClick}
                >
                  <Icons.X />
                </button>
              </TabTrapper>
            </div>
          </div>,
          bodyElement
        );
  }
}

export default Modal;
