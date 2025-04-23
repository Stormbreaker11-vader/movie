import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv, Search, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-gray-900 dark:bg-dark-secondary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="w-6 h-6" />
            <span className="font-bold text-xl">MovieDB</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/movies" className="flex items-center space-x-1 hover:text-gray-300">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Movies</span>
            </Link>
            <Link to="/tv" className="flex items-center space-x-1 hover:text-gray-300">
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">TV Shows</span>
            </Link>
            <Link to="/search" className="flex items-center space-x-1 hover:text-gray-300">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Sun className="w-5 h-5 hidden dark:block" />
              <Moon className="w-5 h-5 block dark:hidden" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}