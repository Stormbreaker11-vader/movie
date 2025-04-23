export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      name: string;
    }>;
  };
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      name: string;
    }>;
  };
}

export type MediaType = 'movie' | 'tv';