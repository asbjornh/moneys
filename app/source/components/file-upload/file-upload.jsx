import React from "react";
import PropTypes from "prop-types";

import css from "./file-upload.module.scss";

function readFile(e, callback) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    callback(contents);
  };
  reader.readAsText(file);
}

const FileUpload = ({ accept, label, onFileUpload }) => (
  <label className={css.fileUpload}>
    {label}
    <input
      type="file"
      accept={accept}
      onChange={e => readFile(e, onFileUpload)}
    />
  </label>
);

FileUpload.propTypes = {
  accept: PropTypes.string,
  label: PropTypes.string,
  onFileUpload: PropTypes.func
};

export default FileUpload;
