import axios from 'axios';
import { Movie, TVShow, MediaType } from '../types/tmdb';

const API_KEY = '51d91894475b90ea5449bb71c1cd0a65';
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

const filterResults = (results: (Movie | TVShow)[], genre?: number, minRating?: number) => {
  return results.filter((item) => {
    const passesGenre = !genre || (item.genre_ids && item.genre_ids.includes(genre));
    const passesRating = !minRating || item.vote_average >= minRating;
    return passesGenre && passesRating;
  });
};

export const getLatest = async (type: MediaType, { genre, minRating }: { genre?: number; minRating?: number } = {}) => {
  const endpoint = type === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
  const response = await tmdbApi.get(endpoint);
  return filterResults(response.data.results, genre, minRating);
};

export const getUpcoming = async (type: MediaType, { genre, minRating }: { genre?: number; minRating?: number } = {}) => {
  const endpoint = type === 'movie' ? '/movie/upcoming' : '/tv/airing_today';
  const response = await tmdbApi.get(endpoint);
  return filterResults(response.data.results, genre, minRating);
};

export const getTrending = async (type: MediaType, { genre, minRating }: { genre?: number; minRating?: number } = {}) => {
  const response = await tmdbApi.get(`/trending/${type}/week`);
  return filterResults(response.data.results, genre, minRating);
};

export const search = async (query: string, type: MediaType, { genre, minRating }: { genre?: number; minRating?: number } = {}) => {
  const response = await tmdbApi.get(`/search/${type}`, {
    params: { query },
  });
  return filterResults(response.data.results, genre, minRating);
};

export const getDetails = async (id: string, type: MediaType) => {
  const response = await tmdbApi.get(`/${type}/${id}`, {
    params: {
      append_to_response: 'videos',
    },
  });
  return response.data;
};

export const getGenres = async (type: MediaType) => {
  const response = await tmdbApi.get(`/genre/${type}/list`);
  return response.data.genres;
};