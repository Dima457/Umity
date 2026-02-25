// SearchBar.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  //* 🔥 Стабилизируем onSearch с useCallback
  const stableOnSearch = useCallback(onSearch, []);

  useEffect(() => {
    stableOnSearch(query);
  }, [query, onSearch]);

  return (
    <form className="flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск постов..."
        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </form>
  );
}