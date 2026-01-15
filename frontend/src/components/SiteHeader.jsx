import React from 'react';
import { Link } from 'react-router-dom';

const SiteHeader = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-[var(--background-light)] shadow-md">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="../assets/logo1.png" 
            alt="Petopia Logo" 
            className="h-25 mr-4"
          />
        </Link>
        <nav className="space-x-4">
          <Link to="/" className="text-gray-800 hover:text-pink-500 transition-colors">Home</Link>
          <Link to="/store" className="text-gray-800 hover:text-pink-500 transition-colors">Store</Link>
          <Link to="/about" className="text-gray-800 hover:text-pink-500 transition-colors">About us</Link>
          <Link to="/adopt" className="text-gray-800 hover:text-pink-500 transition-colors">Adopt Now</Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Link 
          to="/login" 
          className="bg-[var(--main-color)]/50 text-white px-6 py-2 rounded-full border hover:bg-[var(--main-color)] transition-colors"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="bg-pink-400 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
};

export default SiteHeader;