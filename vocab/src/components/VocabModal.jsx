import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

export default function VocabModal({ children, onClose }) {
  return ReactDOM.createPortal(
    <div className="modal-container">
      <button className="modal-underlay" onClick={onClose} />
      <div className="modal-content">{children}</div>
    </div>,
    document.getElementById("portal"),
  );
}

VocabModal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};
