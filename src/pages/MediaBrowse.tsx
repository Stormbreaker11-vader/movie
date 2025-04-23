import React, { useEffect, useState } from 'react';
import { getLatest, getUpcoming, getTrending, getGenres } from '../services/tmdb';
import MediaGrid from '../components/MediaGrid';
import FilterBar from '../components/FilterBar';
import { Movie, TVShow, MediaType } from '../types/tmdb';

interface Props {
  type: MediaType;
}

export default function MediaBrowse({ type }: Props) {
  const [latest, setLatest] = useState<(Movie | TVShow)[]>([]);
  const [upcoming, setUpcoming] = useState<(Movie | TVShow)[]>([]);
  const [trending, setTrending] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>();
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      const genreList = await getGenres(type);
      setGenres(genreList);
    };
    fetchGenres();
  }, [type]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [latestData, upcomingData, trendingData] = await Promise.all([
          getLatest(type, { genre: selectedGenre, minRating }),
          getUpcoming(type, { genre: selectedGenre, minRating }),
          getTrending(type, { genre: selectedGenre, minRating }),
        ]);

        setLatest(latestData);
        setUpcoming(upcomingData);
        setTrending(trendingData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, selectedGenre, minRating]);

  const getTitle = (section: string) => {
    if (type === 'movie') {
      return section === 'latest' ? 'Now Playing'
        : section === 'upcoming' ? 'Upcoming'
        : 'Trending';
    } else {
      return section === 'latest' ? 'Currently Airing'
        : section === 'upcoming' ? 'Airing Today'
        : 'Trending';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {type === 'movie' ? 'Movies' : 'TV Shows'}
      </h1>

      <FilterBar
        genres={genres}
        selectedGenre={selectedGenre}
        minRating={minRating}
        onGenreChange={setSelectedGenre}
        onRatingChange={setMinRating}
      />

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{getTitle('latest')}</h2>
            <MediaGrid items={latest} type={type} />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{getTitle('upcoming')}</h2>
            <MediaGrid items={upcoming} type={type} />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{getTitle('trending')}</h2>
            <MediaGrid items={trending} type={type} />
          </section>
        </>
      )}
    </div>
  );
}