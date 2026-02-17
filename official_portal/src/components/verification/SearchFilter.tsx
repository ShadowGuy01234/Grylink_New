import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { STATUS_CONFIGS } from './types';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  placeholder?: string;
  showAllOption?: boolean;
}

export const SearchFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  placeholder = 'Search...',
  showAllOption = true,
}: SearchFilterProps) => {
  // Default status options from STATUS_CONFIGS
  const defaultStatusOptions = Object.entries(STATUS_CONFIGS).map(([key, config]) => ({
    value: key,
    label: config.label,
  }));

  const options = statusOptions || defaultStatusOptions;

  return (
    <div className="search-filter">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <HiOutlineSearch className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-btn" onClick={() => onSearchChange('')}>
            <HiOutlineX />
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="status-tabs">
        {showAllOption && (
          <button
            className={`status-tab ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => onStatusChange('')}
          >
            All
          </button>
        )}
        {options.map((option) => (
          <button
            key={option.value}
            className={`status-tab ${statusFilter === option.value ? 'active' : ''}`}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <style>{`
        .search-filter {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          font-size: 18px;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 36px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          background: white;
          transition: all 0.15s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .clear-btn {
          position: absolute;
          right: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .clear-btn:hover {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .status-tab {
          padding: 6px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background: white;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .status-tab:hover {
          border-color: #d1d5db;
          background: #f9fafb;
          color: #374151;
        }

        .status-tab.active {
          border-color: #2563eb;
          background: #2563eb;
          color: white;
        }

        @media (max-width: 480px) {
          .status-tabs {
            gap: 4px;
          }
          
          .status-tab {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchFilter;
