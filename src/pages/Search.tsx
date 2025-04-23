import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { search } from '../services/tmdb';
import MediaGrid from '../components/MediaGrid';
import { Movie, TVShow, MediaType } from '../types/tmdb';

export default function Search() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType>('movie');
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchResults = await search(query, type);
      setResults(searchResults);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as MediaType)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          <MediaGrid items={results} type={type} />
        </section>
      )}
    </div>
  );
}