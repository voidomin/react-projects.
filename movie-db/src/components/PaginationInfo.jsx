import PropTypes from "prop-types";
import "./PaginationInfo.css";

export default function PaginationInfo({
  currentPage,
  totalPages,
  itemsPerPage = 18,
  totalItems,
  isLoading = false,
}) {
  if (totalPages <= 1) return null;

  const displayItems = Math.max(
    0,
    Math.min(currentPage * itemsPerPage, totalItems),
  );

  return (
    <div className="pagination-info">
      <p className="pagination-text">
        Showing {displayItems}
        {totalItems ? ` of ${totalItems}` : ""} items
      </p>
      <div className="pagination-indicators">
        <span className="page-indicator">
          Page {currentPage} of {totalPages}
        </span>
        {isLoading && <span className="loading-indicator">Loading...</span>}
      </div>
    </div>
  );
}

PaginationInfo.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number,
  totalItems: PropTypes.number,
  isLoading: PropTypes.bool,
};
