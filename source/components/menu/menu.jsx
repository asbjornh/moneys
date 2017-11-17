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
  onCurrencySelect,
  userCurrency
}) => (
  <div className={cn(css.menu, { [css.isVisible]: isVisible })}>
    <ul>
      <li>
        <button type="button" onClick={deleteAllData}>
          Slett alle data
        </button>
      </li>
      <li>
        <a
          href={createDownloadLink(api.getBackupData())}
          download="moneys.json"
        >
          Last ned backup
        </a>
      </li>
      <li>
        <FileUpload
          label="Last opp backup"
          accept="application/json"
          onFileUpload={onFileUpload}
        />
      </li>
      <li>
        {currencies && (
          <Select
            confirmationMessage="Dette vil slette alle data. Vil du fortsette?"
            defaultValue={userCurrency}
            label="Valuta"
            onChange={onCurrencySelect}
            requireConfirmation={true}
            values={Object.keys(currencies)}
          />
        )}
      </li>
    </ul>
  </div>
);

Menu.propTypes = {
  currencies: PropTypes.object,
  deleteAllData: PropTypes.func,
  isVisible: PropTypes.bool,
  onCurrencySelect: PropTypes.func,
  userCurrency: PropTypes.string
};

export default Menu;
