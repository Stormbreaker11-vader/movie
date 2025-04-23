import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDetails } from '../services/tmdb';
import { Movie, TVShow, MediaType } from '../types/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import StreamPlayer from '../components/StreamPlayer';
import { ArrowLeft, Calendar, Clock, Star, Info, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DetailProps {
  type: MediaType;
}

export default function MediaDetail({ type }: DetailProps) {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<Movie | TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStream, setShowStream] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getDetails(id, type);
        setDetails(data);
        
        // For TV shows, set initial season and episode
        if (type === 'tv' && data.seasons && data.seasons.length > 0) {
          setSeason(1); // Usually start with season 1
          setEpisode(1); // Start with episode 1
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Content not found</h1>
        <Link to={`/${type}s`} className="text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {type === 'movie' ? 'Movies' : 'TV Shows'}
        </Link>
      </div>
    );
  }

  // Extract cast for display
  const cast = details.credits?.cast?.slice(0, 5) || [];
  
  // Helper for release date format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // TV show specific data
  const seasonOptions = type === 'tv' && details.seasons ? details.seasons : [];
  const episodeCount = type === 'tv' && details.seasons && details.seasons[season - 1]
    ? details.seasons[season - 1].episode_count
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to={`/${type}s`} className="text-blue-500 flex items-center mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {type === 'movie' ? 'Movies' : 'TV Shows'}
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="rounded-lg overflow-hidden shadow-lg">
            {details.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.title || details.name}
                className="w-full h-auto"
              />
            ) : (
              <div className="bg-gray-200 w-full aspect-[2/3] flex items-center justify-center">
                <Info className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-3xl font-bold mb-2">{details.title || details.name}</h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
            {(details.release_date || details.first_air_date) && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(details.release_date || details.first_air_date)}
              </div>
            )}
            
            {details.runtime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {details.runtime} minutes
              </div>
            )}
            
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {details.vote_average.toFixed(1)} ({details.vote_count} votes)
            </div>
          </div>
          
          {/* Genres */}
          {details.genres && details.genres.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4" />
                {details.genres.map(genre => (
                  <span key={genre.id} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Overview */}
          {details.overview && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-800 dark:text-gray-200">{details.overview}</p>
            </div>
          )}
          
          {/* Cast */}
          {cast.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <div className="flex flex-wrap gap-2">
                {cast.map(actor => (
                  <span key={actor.id} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm">
                    {actor.name} as {actor.character}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* TV Show Season/Episode Selector */}
          {type === 'tv' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Season & Episode</h2>
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Season</label>
                  <select 
                    value={season}
                    onChange={(e) => {
                      setSeason(parseInt(e.target.value));
                      setEpisode(1); // Reset episode when season changes
                    }}
                    className="w-full sm:w-36 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                  >
                    {seasonOptions.map((s, index) => (
                      <option key={s.id || index} value={s.season_number}>
                        Season {s.season_number} {s.name !== `Season ${s.season_number}` ? `(${s.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Episode</label>
                  <select 
                    value={episode}
                    onChange={(e) => setEpisode(parseInt(e.target.value))}
                    className="w-full sm:w-36 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                  >
                    {Array.from({ length: episodeCount }, (_, i) => (
                      <option key={i} value={i + 1}>
                        Episode {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Watch Options */}
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setShowStream(!showStream)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {showStream ? 'Hide Stream' : 'Stream Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {details.videos && !showStream && <VideoPlayer videos={details.videos.results} />}
      
      {/* Stream Section */}
      {showStream && (
        <StreamPlayer 
          type={type} 
          tmdbId={id || ''} 
          title={details.title || details.name || ''}
          episodeData={type === 'tv' ? { season, episode } : undefined}
        />
      )}
    </div>
  );
}