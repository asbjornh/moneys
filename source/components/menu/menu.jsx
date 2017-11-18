import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import api from "../../js/api-helper";
import css from "./menu.module.scss";
import FileUpload from "../file-upload";
import Select from "../select";

const createDownloadLink = content => {
  var file = new Blob([content], { type: "application/json" });
  return URL.createObjectURL(file);
};

const onFileUpload = content => {
  api.insertBackupData(content);
};

const Menu = ({
  currencies,
  deleteAllData,
  isVisible,
  labels,
  languages,
  onCurrencySelect,
  onLanguageSelect,
  userCurrency,
  userLanguage
}) => (
  <div className={cn(css.menu, { [css.isVisible]: isVisible })}>
    <ul>
      <li>
        <button type="button" onClick={deleteAllData}>
          {labels.deleteAllData}
        </button>
      </li>
      <li>
        <a
          href={createDownloadLink(api.getBackupData())}
          download="moneys.json"
        >
          {labels.downloadBackup}
        </a>
      </li>
      <li>
        <FileUpload
          label={labels.uploadBackup}
          accept="application/json"
          onFileUpload={onFileUpload}
        />
      </li>
      <li>
        {currencies && (
          <Select
            confirmationMessage={labels.currencyConfirmationMessage}
            defaultValue={userCurrency}
            label={labels.currencySelect}
            onChange={onCurrencySelect}
            requireConfirmation={true}
            values={Object.keys(currencies).map(currency => ({
              label: currency,
              value: currency
            }))}
          />
        )}
      </li>
      <li>
        <Select
          defaultValue={userLanguage}
          onChange={onLanguageSelect}
          values={languages.map(language => ({
            label: language.name,
            value: language.id
          }))}
        />
      </li>
    </ul>
  </div>
);

Menu.propTypes = {
  currencies: PropTypes.object,
  deleteAllData: PropTypes.func,
  isVisible: PropTypes.bool,
  labels: PropTypes.object,
  languages: PropTypes.array,
  onCurrencySelect: PropTypes.func,
  onLanguageSelect: PropTypes.func,
  userCurrency: PropTypes.string,
  userLanguage: PropTypes.string
};

Menu.defaultProps = {
  labels: {}
};

export default Menu;
