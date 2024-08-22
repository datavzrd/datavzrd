//@ts-nocheck

import * as pagination from "@zag-js/pagination";
import { useMachine, normalizeProps } from "@zag-js/react";
import Select from "./Select";
import { getId } from "../../App";
import './Pagination.css';
import { useEffect, useState } from "react";

interface PaginationProps {
  data: any;
  onPageChange: (page: number) => void;
  onRowCountChange: (page: number) => void;
  currentRowCount: number;
}

export default function Pagination({ data, onPageChange, currentRowCount, onRowCountChange }: PaginationProps) {
  let count;

  if (config.is_single_page) {
    count = data.length
  } else {
    count = config.pages * config.page_size
  }
  const [state, send] = useMachine(
    pagination.machine({ id: getId(`tablePagination`), count: count, pageSize: config.page_size, siblingCount: 1 }),
  );

  const [rowLastIndex, setRowLastIndex] = useState(0);

  const api = pagination.connect(state, send, normalizeProps);

  useEffect(() => {
    if (currentRowCount * (api.page - 1) + currentRowCount > data.length) {
      var lastIndex = data.length
    } else {
      lastIndex = currentRowCount * (api.page - 1) + currentRowCount
    }
    setRowLastIndex(lastIndex);
  }, [api.page, currentRowCount, data.length]);

  if (!config.is_single_page) {
    var pageNumber = window.location.href.match(/index_(\d+)\.html/);
    api.setPage(parseInt(pageNumber[1]))
  }

  const handlePageClick = (page: number) => {
    api.setPage(page);
    if (config.is_single_page) {
      onPageChange(page);
    } else {
      window.location.href = `index_${page}.html`
    }
  };

  const handlePrevClick = () => {
    api.goToPrevPage();
    if (api.page - 1 <= 0) return;
    if (config.is_single_page) {
      onPageChange(api.page - 1);
    } else {
      window.location.href = `index_${api.page - 1}.html`
    }
  };

  const handleNextClick = () => {
    api.goToNextPage();
    if (api.page + 1 > api.totalPages) return;
    if (config.is_single_page) {
      onPageChange(api.page + 1);
    } else {
      window.location.href = `index_${api.page + 1}.html`
    }
  };

  const handleRowCountChange = (newRowCount: number) => {
    api.setPageSize(newRowCount)
    api.setPage(api.page)
    onPageChange(api.page)
    onRowCountChange(newRowCount)
  }

  return (
    <div className="table-pagination">
      { config.is_single_page && (
      <div className="pagination-detail">
        <span className="pagination-info">
          Showing {currentRowCount * (api.page - 1) + 1} to {rowLastIndex} of {data.length} rows
        </span>
        <Select
          onRowCountChange={handleRowCountChange}  
        />
        rows per page
      </div>
      )}
      {api.totalPages > 1 && (
        <nav {...api.getRootProps()}>
          <ul>
            <li>
              <button onClick={handlePrevClick} className="prev-btn">
                <span className="visually-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
                    <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                  </svg>
                </span>
              </button>
            </li>
            {api.pages.map((page, i) => {
              if (page.type === "page") {
                const isSelected = page.value === api.page;
                return (
                  <li key={page.value}>
                    <button onClick={() => handlePageClick(page.value)} className={`page-btn ${isSelected ? 'selected' : ''}`}>
                      {page.value}
                    </button>
                  </li>
                )
              }
              else
                return (
                  <li key={`ellipsis-${i}`}>
                    <span className="ellipsis-btn" {...api.getEllipsisProps({ index: i })}>&#8230;</span>
                  </li>
                )
            })}
            <li>
              <button onClick={handleNextClick} className="next-btn">
                <span className="visually-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                    <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                  </svg>
                </span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
