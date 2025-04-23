import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MediaBrowse from './pages/MediaBrowse';
import MediaDetail from './pages/MediaDetail';
import Search from './pages/Search';

function App() {
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary dark:text-dark-text transition-colors duration-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MediaBrowse type="movie" />} />
          <Route path="/tv" element={<MediaBrowse type="tv" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/:type/:id" element={<MediaDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App