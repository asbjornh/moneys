import React from "react";
import PropTypes from "prop-types";

import css from "./menu.module.scss";

import storage from "../../js/storage-helper";

import FileUpload from "../file-upload";
import Modal from "../modal";

class UploadBackup extends React.Component {
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

  storeData = data => {
    storage.insertBackupData(data, success => {
      if (success) {
        window.location.reload();
      } else {
        alert(this.props.labels.uploadBackupFailed);
      }
    });
  };

  onFileUpload = content => {
    this.storeData(content);
  };

  submit = () => {
    this.storeData(this.textarea.value);
  };

  render() {
    return (
      <React.Fragment>
        <button onClick={this.showModal}>
          {this.props.labels.uploadBackupButton}
        </button>

        <Modal
          isVisible={this.state.modalIsVisible}
          onCloseClick={this.hideModal}
        >
          <div className={css.menuModal}>
            <p>{this.props.labels.uploadBackupTitle}</p>

            <textarea ref={textarea => (this.textarea = textarea)} />

            <div className={css.modalButtonContainer}>
              <button onClick={this.submit}>
                {this.props.labels.uploadBackupSubmit}
              </button>
            </div>

            <FileUpload
              label={this.props.labels.uploadBackupInput}
              accept="application/json"
              onFileUpload={this.onFileUpload}
            />
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default UploadBackup;
