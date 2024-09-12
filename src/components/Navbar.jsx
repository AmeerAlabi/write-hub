import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-lg fixed w-full top-0 z-50">
      <Link to="/" className="text-3xl font-extrabold tracking-wide text-white">
        Write-Hub
      </Link>

      <div className="lg:hidden">
        <button onClick={toggleMenu} className="text-white text-2xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`lg:flex items-center space-x-6 lg:space-x-6 ${
          menuOpen ? 'block' : 'hidden'
        } lg:block absolute lg:relative top-full left-0 right-0 bg-gray-800 lg:bg-transparent px-6 lg:px-0 py-4 lg:py-0 transition-all duration-300 ease-in-out`}
      >
        <Link
          to="/"
          className="block lg:inline-block text-gray-300 hover:text-white transition-colors duration-200"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/blog"
          className="block lg:inline-block text-gray-300 hover:text-white transition-colors duration-200"
          onClick={() => setMenuOpen(false)}
        >
          Blog
        </Link>
        <Link
          to="/contact"
          className="block lg:inline-block text-gray-300 hover:text-white transition-colors duration-200"
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </Link>
        <Link
          to="/dashboard"
          onClick={() => setMenuOpen(false)}
          className="block lg:inline-block"
        >
          <button className="w-full lg:w-auto py-2 px-4 bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-lg shadow-lg">
            Dashboard
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
