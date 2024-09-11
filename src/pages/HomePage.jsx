import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { motion } from 'framer-motion';

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsCollection = collection(db, 'post');
      const postsSnapshot = await getDocs(postsCollection);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      postsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      setError("Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const defaultImage = 'https://via.placeholder.com/600x400?text=No+Image+Available'; // Default image URL

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-lg fixed w-full top-0 z-50">
        <Link to="/" className="text-3xl font-extrabold tracking-wide text-white">Write-Hub</Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">Home</Link>
          <Link to="/blog" className="text-gray-300 hover:text-white transition-colors duration-200">Blog</Link>
          <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</Link>
          <Link to="/dashboard">
            <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-lg shadow-lg">Dashboard</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-cover bg-center w-full mx-auto rounded-2xl h-[600px] shadow-lg" style={{ backgroundImage: `url('https://unsplash.com/photos/a-black-and-white-photo-of-a-wall-made-up-of-squares-boA__qFJpw4')` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black flex flex-col justify-center items-center">
          <motion.h1 className="text-5xl font-extrabold text-white mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}>
            Explore Ideas & Inspiration
          </motion.h1>
          <motion.p className="text-xl mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}>
            Your hub for knowledge, stories, and creativity.
          </motion.p>
          <Link to="/blog">
            <motion.button 
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4 }}>
              Explore
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 px-6 bg-gray-900">
        <h2 className="text-4xl font-bold mb-10 text-center text-white">Latest Posts</h2>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.slice(0, 6).map(post => (
              <motion.div
                key={post.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-2xl transform hover:scale-105"
                whileHover={{ scale: 1.05 }}>
                <Link to={`/post/${post.id}`}>
                  <img 
                    src={post.image || defaultImage} // Use default image if none exists
                    alt={post.title} 
                    className="w-full h-48 object-cover" 
                  />
                  <div className="p-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{post.title}</h3>
                    <p className="text-gray-400">{post.content.substring(0, 100)}...</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black">
        <div className="text-center">
          <p className="text-gray-500">&copy; 2024 Write-Hub. All Rights Reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</Link>
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
