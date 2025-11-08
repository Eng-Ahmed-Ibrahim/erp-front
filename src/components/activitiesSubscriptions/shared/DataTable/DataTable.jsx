import React from 'react';
import './DataTable.scss';

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  onRowClick = null,
  actions = null,
  pagination = null,
  onPageChange = null
}) => {
  if (loading) {
    return (
      <div className="data-table data-table--loading">
        <div className="data-table__loading">
          <div className="loading-spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table data-table--empty">
        <div className="data-table__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="data-table__empty-icon">
            <path 
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <p className="data-table__empty-message">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      <div className="data-table__container">
        <table className="data-table__table">
          <thead className="data-table__header">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="data-table__header-cell">
                  {column.header}
                </th>
              ))}
              {actions && <th className="data-table__header-cell data-table__header-cell--actions">Actions</th>}
            </tr>
          </thead>
          <tbody className="data-table__body">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="data-table__cell">
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="data-table__cell data-table__cell--actions">
                    {actions(row, rowIndex)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && onPageChange && (
        <div className="data-table__pagination">
          <div className="pagination-info">
            <span>
              عرض {pagination.from || 0} إلى {pagination.to || 0} من {pagination.total || 0} عنصر
            </span>
          </div>
          
          <div className="pagination-controls">
            {/* Previous Button */}
            <button
              className="pagination-btn"
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              السابق
            </button>
            
            {/* Page Numbers */}
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) {
                  pageNum = i + 1;
                } else if (pagination.current_page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.current_page >= pagination.last_page - 2) {
                  pageNum = pagination.last_page - 4 + i;
                } else {
                  pageNum = pagination.current_page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${pagination.current_page === pageNum ? 'pagination-btn--active' : ''}`}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* Next Button */}
            <button
              className="pagination-btn"
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
            >
              التالي
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="pagination-size">
            <select
              value={pagination.per_page}
              onChange={(e) => onPageChange(1, parseInt(e.target.value))}
              className="pagination-select"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>عناصر في الصفحة</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
