import React from 'react';
import { Filter } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
}

interface Props {
  genres: Genre[];
  selectedGenre: number | undefined;
  minRating: number;
  onGenreChange: (genreId: number | undefined) => void;
  onRatingChange: (rating: number) => void;
}

export default function FilterBar({ genres, selectedGenre, minRating, onGenreChange, onRatingChange }: Props) {
  return (
    <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="font-semibold dark:text-white">Filters:</span>
        </div>
        
        <div className="flex-1">
          <select
            value={selectedGenre || ''}
            onChange={(e) => onGenreChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-dark-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold dark:text-white">Min Rating:</span>
          <select
            value={minRating}
            onChange={(e) => onRatingChange(Number(e.target.value))}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-dark-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">All Ratings</option>
            {[7, 7.5, 8, 8.5, 9].map((rating) => (
              <option key={rating} value={rating}>
                {rating}+ ⭐
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}