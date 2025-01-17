import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative h-9 min-w-[2.25rem] flex items-center justify-center text-sm font-medium
            transition-all duration-300 hover:scale-110 backdrop-blur-sm
            ${currentPage === i 
              ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-500/20 border border-blue-400/50 scale-110' 
              : 'text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50'
            } rounded-lg mx-1`}
        >
          {i}
          {currentPage === i && (
            <div className="absolute inset-0 rounded-lg bg-blue-400/20 animate-pulse" />
          )}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            text-zinc-400 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50
            hover:bg-zinc-700/50 hover:text-white hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-300 group"
        >
          <ChevronLeftIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            text-zinc-400 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50
            hover:bg-zinc-700/50 hover:text-white hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-300 group"
        >
          Next
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            Page <span className="font-medium text-white">{currentPage}</span> of{' '}
            <span className="font-medium text-white">{totalPages}</span>
          </p>
        </div>
        <nav className="isolate inline-flex items-center gap-3" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-lg p-2.5
              text-zinc-400 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50
              hover:bg-zinc-700/50 hover:text-white hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-300 group"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>
          <div className="flex bg-zinc-800/30 backdrop-blur-md border border-zinc-700/50 rounded-xl p-1 shadow-xl">
            {renderPageNumbers()}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-lg p-2.5
              text-zinc-400 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50
              hover:bg-zinc-700/50 hover:text-white hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-300 group"
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
}