import React, { useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  searchPlaceholder = 'Search records...',
  searchKey,
  pagination,
  actions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = searchKey && searchTerm
    ? data.filter((item) => {
        const val = item[searchKey];
        return val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false;
      })
    : data;

  return (
    <div>
      {(searchKey || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {searchKey && (
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '36px', height: '40px' }}
              />
            </div>
          )}

          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <LoadingSpinner message="Fetching data..." />
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Inbox size={28} />
            </div>
            <h4>No records available</h4>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} style={col.width ? { width: col.width } : {}}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.size}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;
