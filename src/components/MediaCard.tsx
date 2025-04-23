import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie, TVShow } from '../types/tmdb';

interface Props {
  media: Movie | TVShow;
  type: 'movie' | 'tv';
}

export default function MediaCard({ media, type }: Props) {
  const title = type === 'movie' ? (media as Movie).title : (media as TVShow).name;
  const releaseDate = type === 'movie' 
    ? (media as Movie).release_date 
    : (media as TVShow).first_air_date;

  return (
    <Link to={`/${type}/${media.id}`} className="block">
      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg h-full">
        <div className="aspect-[2/3] relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 dark:text-white">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(releaseDate).getFullYear()}
            </span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm">{media.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}