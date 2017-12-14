import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./header.module.scss";
import Gear from "../icons/gear";
import Refresh from "../icons/refresh";
import Spinner from "../spinner";
import X from "../icons/x";

const refreshWindow = () => {
  window.location.reload();
};

const Header = ({
  hasAvailableUpdate,
  isLoading,
  labels,
  menuIsVisible,
  toggleMenu
}) => (
  <div className={css.header}>
    <div className={css.refreshContainer}>
      <button
        type="button"
        className={cn(css.refreshButton, {
          [css.updateAvailable]: hasAvailableUpdate
        })}
        onClick={refreshWindow}
      >
        <span className={css.icon}>
          <Refresh />
        </span>
      </button>

      {hasAvailableUpdate && (
        <div className={css.updateBanner}>{labels.updateAvailable}</div>
      )}
    </div>

    <div className={css.spinner}>
      <Spinner isLoading={isLoading} />
    </div>

    <button type="button" className={css.menuButton} onClick={toggleMenu}>
      <span className={cn(css.icon, { [css.isActive]: !menuIsVisible })}>
        <Gear />
      </span>
      <span className={cn(css.icon, { [css.isActive]: menuIsVisible })}>
        <X />
      </span>
    </button>
  </div>
);

Header.propTypes = {
  hasAvailableUpdate: PropTypes.bool,
  isLoading: PropTypes.bool,
  labels: PropTypes.object,
  menuIsVisible: PropTypes.bool,
  toggleMenu: PropTypes.func
};

export default Header;
