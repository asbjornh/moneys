import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./menu.module.scss";

const Menu = ({ isVisible, deleteAllStocks }) => (
  <div className={cn(css.menu, { [css.isVisible]: isVisible })}>
    <ul>
      <li>
        <button type="button" onClick={deleteAllStocks}>
          Slett alle aksjer
        </button>
      </li>
    </ul>
  </div>
);

Menu.propTypes = {
  isVisible: PropTypes.bool,
  deleteAllStocks: PropTypes.func
};

export default Menu;
