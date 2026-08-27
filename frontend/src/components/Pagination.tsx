import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with ellipsis if many pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border-warm/60 bg-card/50 text-xs text-foreground/70 ${className}`}>
      {/* Items count & page size selector */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="font-bold text-foreground">{startItem}</strong> to{" "}
          <strong className="font-bold text-foreground">{endItem}</strong> of{" "}
          <strong className="font-bold text-foreground">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-background border border-border-warm rounded-lg px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:border-gold cursor-pointer"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-lg border border-border-warm bg-background hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-background text-foreground font-semibold transition-colors flex items-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
        >
          ‹ Prev
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-gold text-white shadow-xs"
                    : "bg-background border border-border-warm text-foreground hover:bg-white/5"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-foreground/40 font-bold">
                {page}
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-border-warm bg-background hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-background text-foreground font-semibold transition-colors flex items-center gap-1 text-[11px] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
