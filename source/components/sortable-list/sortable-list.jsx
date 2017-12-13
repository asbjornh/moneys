import React from "react";
import PropTypes from "prop-types";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

const SortableItem = SortableElement(({ children }) => children);

const SortableList = ({ className, children, element }) =>
  React.createElement(
    element,
    { className },
    React.Children.map(children, (child, index) => (
      <SortableItem index={index}>{child}</SortableItem>
    ))
  );

SortableList.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node),
  element: PropTypes.string
};

SortableList.defaultProps = {
  element: "div"
};

export default SortableContainer(SortableList);
