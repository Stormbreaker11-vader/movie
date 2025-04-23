import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Calendar, Star, Tv, Film } from 'lucide-react';
import { getDetails } from '../services/tmdb';
import { Movie, TVShow, MediaType } from '../types/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import StreamPlayer from '../components/StreamPlayer';

export default function MediaDetail() {
  const { type, id } = useParams<{ type: MediaType; id: string }>();
  const [media, setMedia] = useState<Movie | TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    const fetchDetails = async () => {
      if (id && type) {
        const details = await getDetails(id, type);
        setMedia(details);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  if (loading || !media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const title = type === 'movie' ? (media as Movie).title : (media as TVShow).name;
  const releaseDate = type === 'movie'
    ? (media as Movie).release_date
    : (media as TVShow).first_air_date;

  return (
    <div className="pb-12">
      <div
        className="h-[60vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${media.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="flex gap-8">
              <img
                src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                alt={title}
                className="w-64 h-96 rounded-lg shadow-lg"
              />
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{title}</h1>
                {media.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">{media.tagline}</p>
                )}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span>{media.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-1" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                  {type === 'movie' ? (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-1" />
                      <span>{(media as Movie).runtime} min</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Tv className="w-5 h-5 mr-1" />
                      <span>
                        {(media as TVShow).number_of_seasons} Seasons,{' '}
                        {(media as TVShow).number_of_episodes} Episodes
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  {media.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-blue-500 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
                <p className="text-lg leading-relaxed">{media.overview}</p>
                
                {type === 'tv' && (
                  <div className="mt-4 flex gap-4">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600"
                    >
                      {Array.from({ length: (media as TVShow).number_of_seasons || 0 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Season {i + 1}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600"
                    >
                      {Array.from({ length: (media as Episodes).number_of_episodes || 0 }, (_, i)  => (
                        <option key={i + 1} value={i + 1}>
                          Episode {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <StreamPlayer
          type={type}
          tmdbId={id || ''}
          title={title}
          episodeData={type === 'tv' ? { season: selectedSeason, episode: selectedEpisode } : undefined}
        />
        {media.videos?.results && <VideoPlayer videos={media.videos.results} />}
      </div>
    </div>
  );
}