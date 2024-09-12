import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaArrowLeft } from 'react-icons/fa';

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown Date';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  if (isNaN(date.getTime())) return 'Unknown Date';
  return date.toLocaleDateString();
};

const getNickname = (email) => {
  if (!email) return 'Cool Genius';
  const coolNicknames = ['Explorer', 'Champ', 'Hero', 'Mastermind', 'Genius'];
  const emailDomain = email.split('@')[1]?.split('.')[0];
  const randomNickname = coolNicknames[Math.floor(Math.random() * coolNicknames.length)];
  return emailDomain ? `Mighty ${emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1)}` : `Cool ${randomNickname}`;
};

const getGreeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'Good Morning';
  if (hours < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const Dashboard = ({ currentUser }) => {
  const { logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsCollection = collection(db, 'post');
      const postsSnapshot = await getDocs(postsCollection);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'post', id));
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      <aside className="w-full md:w-64 bg-gray-800 p-6 flex flex-col justify-between md:h-screen">
        <div>
          <div className="flex items-center mb-10">
            <button
              onClick={() => navigate(-1)}
              className="mr-2 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <FaArrowLeft />
            </button>
            <Link to="/">
              <h1 className="text-2xl font-bold">Write-Hub</h1>
            </Link>
          </div>
          <nav className="space-y-6">
            <Link to="/" className="block py-2 px-3 text-white bg-gray-700 rounded-md text-center">
              Posts Overview
            </Link>
            <Link to="/create" className="block px-3 py-2 text-gray-400 hover:text-white text-center">
              Create New Post
            </Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mb-6 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-center mb-4 md:mb-0">
            {getGreeting()}, {currentUser?.displayName || getNickname(currentUser?.email)}
          </h2>
          <Link to="/create">
            <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center">
              Create New Post
            </button>
          </Link>
        </header>

        <div className="bg-gray-800 rounded-lg shadow-md p-4 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-center md:text-left">Your Posts</h3>
          {loading && <p className="text-gray-400">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <table className="min-w-full text-gray-400 text-center md:text-left">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-700">
                  <td className="py-3 px-4">{post.title}</td>
                  <td className="py-3 px-4">{formatDate(post.date)}</td>
                  <td className="py-3 px-4 flex justify-center md:justify-start space-x-2">
                    <Link to={`/edit/${post.id}`}>
                      <button className="bg-yellow-500 py-1 px-3 rounded">Edit</button>
                    </Link>
                    <button className="bg-red-500 py-1 px-3 rounded" onClick={() => handleDelete(post.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-xl font-bold mb-4 text-center md:text-left">Inspiring Quotes</h3>
          <p className="text-gray-400 text-center md:text-left">
            "The only way to do great work is to love what you do." - Steve Jobs
          </p>
          <p className="text-gray-400 mt-2 text-center md:text-left">
            "Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill
          </p>
          <p className="text-gray-400 mt-2 text-center md:text-left">
            "Do not wait to strike till the iron is hot, but make it hot by striking." - William Butler Yeats
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
