import React, { useEffect, useState } from 'react';
import { getTrending } from '../services/tmdb';
import MediaGrid from '../components/MediaGrid';
import { Movie, TVShow } from '../types/tmdb';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const movies = await getTrending('movie');
      const tvShows = await getTrending('tv');
      setTrendingMovies(movies);
      setTrendingTVShows(tvShows);
    };

    fetchTrending();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to MovieDB</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Trending Movies</h2>
        <MediaGrid items={trendingMovies} type="movie" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Trending TV Shows</h2>
        <MediaGrid items={trendingTVShows} type="tv" />
      </section>
    </div>
  );
}