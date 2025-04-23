import React from 'react';
import MediaCard from './MediaCard';
import { Movie, TVShow, MediaType } from '../types/tmdb';

interface Props {
  items: (Movie | TVShow)[];
  type: MediaType;
}

export default function MediaGrid({ items, type }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} media={item} type={type} />
      ))}
    </div>
  );
}