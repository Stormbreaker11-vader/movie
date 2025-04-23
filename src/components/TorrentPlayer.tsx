// src/components/TorrentPlayer.tsx
import React, { useEffect, useRef, useState } from "react";
import WebTorrent from 'webtorrent';

const TorrentPlayer = ({ magnet }: { magnet: string }) => {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Waiting");

  useEffect(() => {
    const client = new WebTorrent();

    client.add(magnet, (torrent) => {
      setStatus("Downloading...");

      torrent.on("download", () => {
        const percent = Math.round(torrent.progress * 100);
        setProgress(percent);
      });

      torrent.on("done", () => {
        setStatus("Download Complete");
        const file = torrent.files.find(f => f.name.endsWith(".mp4"));
        file?.renderTo(videoRef.current);
      });
    });

    return () => client.destroy();
  }, [magnet]);

  return (
    <div className="p-4 bg-zinc-900 rounded-xl shadow mt-4">
      <h3 className="text-white text-sm">{status}</h3>
      <progress value={progress} max="100" className="w-full my-2" />
      <video ref={videoRef} controls className="w-full rounded-lg" />
    </div>
  );
};

export default TorrentPlayer;
