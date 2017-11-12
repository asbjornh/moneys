import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import api from "../../js/api-helper";
import css from "./menu.module.scss";

const createDownloadLink = content => {
  var file = new Blob([content], { type: "application/json" });
  return URL.createObjectURL(file);
};

const Menu = ({ isVisible, deleteAllStocks }) => (
  <div className={cn(css.menu, { [css.isVisible]: isVisible })}>
    <ul>
      <li>
        <button type="button" onClick={deleteAllStocks}>
          Slett alle aksjer
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
    </ul>
  </div>
);

Menu.propTypes = {
  isVisible: PropTypes.bool,
  deleteAllStocks: PropTypes.func
};

export default Menu;
