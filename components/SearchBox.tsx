'use client';

import { useState, useEffect } from 'react';
import { DEBOUNCE_TIME_MS } from '@/lib/constants';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_TIME_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery);
    } else if (debouncedQuery === '') {
      onSearch('');
    }
  }, [debouncedQuery, onSearch]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe el nombre del producto, marca o número de registro"
          className="w-full px-6 py-4 text-lg text-gray-800 placeholder:text-gray-400 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-3 text-center">
        Escribe el nombre del producto, marca o número de registro
      </p>
    </div>
  );
}
