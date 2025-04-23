import React from 'react';
import { Play } from 'lucide-react';

interface Props {
  videos: Array<{
    key: string;
    site: string;
    type: string;
    name: string;
  }>;
}

export default function VideoPlayer({ videos }: Props) {
  const trailer = videos.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  if (!trailer) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Play className="w-6 h-6 mr-2" />
        Watch Trailer
      </h2>
      <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${trailer.key}`}
          title={trailer.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}