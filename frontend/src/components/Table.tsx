import React, { ReactNode } from 'react';

interface Column {
  key: string;
  header: string;
  render?: (row: any) => ReactNode;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  loading?: boolean;
}

const Table: React.FC<TableProps> = ({ 
  columns, 
  data, 
  emptyMessage = 'No data available',
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="table-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-state">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || row._id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
