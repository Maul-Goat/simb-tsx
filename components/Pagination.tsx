import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

const Pagination: React.FC<{ currentPage: number, totalPages: number, onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center items-center space-x-2 mt-8">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-colors"><ChevronLeftIcon /></button>
        <span className="text-sm font-medium text-text-subtle">Halaman {currentPage} dari {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-colors"><ChevronRightIcon /></button>
    </div>
);

export default Pagination;