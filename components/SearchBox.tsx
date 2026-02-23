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
    <div className="w-full mb-10">
      <div
        className="relative flex items-center px-4 rounded-lg transition-all duration-200"
        style={{
          background: 'var(--surface-alt)',
          border: '1px solid var(--border)',
        }}
      >
        <svg
          className="shrink-0 mr-3 w-4 h-4"
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre del producto, marca o número de registro"
          autoFocus
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            caretColor: 'var(--text-primary)',
            fontFamily: "'DM Mono', monospace",
          }}
          className="w-full py-4 text-sm placeholder:text-[color:var(--text-muted)] focus:outline-none"
        />
        {isLoading && (
          <div className="shrink-0 ml-3">
            <div
              className="w-4 h-4 rounded-full border-2 animate-spin-slow"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-secondary)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
