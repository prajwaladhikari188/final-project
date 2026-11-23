import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search, FileText } from "lucide-react";

const DataTable = ({
  columns,
  data,
  searchPlaceholder = "Search records...",
  itemsPerPage = 8,
  actions = null,
  emptyMessage = "No matching records found."
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === "object") return false;
      return String(val).toLowerCase().includes(term);
    });
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition"
          />
        </div>

        {actions && <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">{actions}</div>}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3.5 px-4 sm:px-6 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-3.5 px-4 sm:px-6 text-slate-700 ${col.cellClassName || ""}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/30">
        <div>
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredData.length === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-700">
            {Math.min(startIndex + itemsPerPage, filteredData.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">{filteredData.length}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
