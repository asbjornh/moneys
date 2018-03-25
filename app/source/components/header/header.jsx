import React from "react";
import PropTypes from "prop-types";

import cn from "classnames";

import css from "./header.module.scss";
import Icons from "../icons";
import Spinner from "../spinner";

const refreshWindow = () => {
  window.location.reload();
};

const Header = ({
  hasAvailableUpdate,
  isLoading,
  isSorting,
  labels,
  menuIsVisible,
  onSortingButtonClick,
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
          <Icons.Refresh />
        </span>
      </button>

      {hasAvailableUpdate && (
        <div className={css.updateBanner}>{labels.updateAvailable}</div>
      )}
    </div>

    <div className={css.spinner}>
      <Spinner isLoading={isLoading} />
    </div>

    <button
      type="button"
      className={cn(css.sortingButton, { [css.isActive]: isSorting })}
      onClick={onSortingButtonClick}
    >
      <span className={css.icon}>
        <Icons.Sort />
      </span>
    </button>

    <button type="button" className={css.menuButton} onClick={toggleMenu}>
      <span className={cn(css.icon, { [css.isActive]: !menuIsVisible })}>
        <Icons.Gear />
      </span>
      <span className={cn(css.icon, { [css.isActive]: menuIsVisible })}>
        <Icons.X />
      </span>
    </button>
  </div>
);

Header.propTypes = {
  hasAvailableUpdate: PropTypes.bool,
  isLoading: PropTypes.bool,
  isSorting: PropTypes.bool,
  labels: PropTypes.object,
  menuIsVisible: PropTypes.bool,
  onSortingButtonClick: PropTypes.func,
  toggleMenu: PropTypes.func
};

export default Header;
