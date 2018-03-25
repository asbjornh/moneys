import React from "react";
import PropTypes from "prop-types";

import css from "./menu.module.scss";

import storage from "../../js/storage-helper";

import Modal from "../modal";

const createDownloadLink = content => {
  var file = new Blob([content], { type: "application/json" });
  return URL.createObjectURL(file);
};

class DownloadBackup extends React.Component {
  static propTypes = {
    labels: PropTypes.object
  };

  state = {
    modalIsVisible: false
  };

  showModal = () => {
    this.setState({ modalIsVisible: true });
  };

  hideModal = () => {
    this.setState({ modalIsVisible: false });
  };

  render() {
    return (
      <React.Fragment>
        <button onClick={this.showModal}>
          {this.props.labels.downloadBackupButton}
        </button>

        <Modal
          isVisible={this.state.modalIsVisible}
          onCloseClick={this.hideModal}
        >
          <div className={css.menuModal}>
            <p>{this.props.labels.downloadBackupTitle}</p>

            <textarea defaultValue={storage.getBackupData()} />

            <a
              href={createDownloadLink(storage.getBackupData())}
              download="moneys.json"
            >
              {this.props.labels.downloadBackupLink}
            </a>
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default DownloadBackup;
