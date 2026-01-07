import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CompactPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const { t } = useTranslation();
  const [pageInput, setPageInput] = useState(currentPage);

  // Sync input with current page when it changes externally
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handleInputBlur = () => {
    const page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1) {
      setPageInput(currentPage);
    } else if (page > totalPages) {
      setPageInput(totalPages);
      onPageChange(totalPages);
    } else if (page !== currentPage) {
      onPageChange(page);
    } else {
      setPageInput(currentPage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center mt-8">
      {/* Previous Button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label={t('common.previous')}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Input */}
      <div className="flex items-center mx-3">
        <input
          type="text"
          value={pageInput}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-16 px-3 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          aria-label={t('properties.current_page')}
        />
        <span className="ml-2 text-gray-600 text-sm whitespace-nowrap">
          / {totalPages} {t('properties.pages')}
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label={t('common.next')}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CompactPagination;
