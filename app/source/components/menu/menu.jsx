import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import storage from "../../js/storage-helper";

import css from "./menu.module.scss";

import DownloadBackup from "./download-backup";
import Select from "../select";
import Switch from "../switch";
import UploadBackup from "./upload-backup";

const Menu = ({
  exchangeRates,
  deleteAllData,
  isVisible,
  labels,
  languages,
  onCurrencySelect,
  onLanguageSelect,
  onShouldConvertStocksSelect,
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
        <DownloadBackup labels={labels} />
      </li>
      <li>
        <UploadBackup labels={labels} />
      </li>
      <li>
        {exchangeRates && (
          <Select
            confirmationMessage={labels.currencyConfirmationMessage}
            defaultValue={userCurrency}
            label={labels.currencySelect}
            onChange={onCurrencySelect}
            requireConfirmation={true}
            values={Object.keys(exchangeRates).map(currency => ({
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
      <li>
        <Switch
          label={labels.convertStocksSwitch}
          defaultValue={storage.getUserSetting("shouldConvertStocks")}
          onChange={onShouldConvertStocksSelect}
        />
      </li>
    </ul>
  </div>
);

Menu.propTypes = {
  exchangeRates: PropTypes.object,
  deleteAllData: PropTypes.func,
  isVisible: PropTypes.bool,
  labels: PropTypes.object,
  languages: PropTypes.array,
  onCurrencySelect: PropTypes.func,
  onLanguageSelect: PropTypes.func,
  onShouldConvertStocksSelect: PropTypes.func,
  userCurrency: PropTypes.string,
  userLanguage: PropTypes.string
};

Menu.defaultProps = {
  labels: {}
};

export default Menu;
