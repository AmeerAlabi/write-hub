import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaArrowLeft, FaBars, FaTimes } from 'react-icons/fa';

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown Date';
  let date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    if (!currentUser || !currentUser.email) {
      console.warn('User is not logged in or user data is missing.');
      return;
    }

    try {
      setLoading(true);
      const postsCollection = collection(db, 'post');
      const postsQuery = query(postsCollection, where('email', '==', currentUser.email));
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map((doc) => ({
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
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      console.error('Failed to log out');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar toggle button for mobile */}
      <button
        className="absolute top-2 left-4 z-50 md:hidden p-4"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-[100vh] w-64 bg-gray-800 p-6 transition-transform transform md:relative md:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-2 p-2 hidden lg:block bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <FaArrowLeft />
          </button>
          <Link to="/home">
            <h1 className="text-2xl lg:ml-0 ml-[60px] font-bold">Write-Hub</h1>
          </Link>
        </div>
        <nav className="space-y-4">
          <Link
            to="/home"
            className="block py-2 px-4 bg-gray-700 rounded-md text-center"
          >
            Posts Overview
          </Link>
          <Link
            to="/create"
            className="block py-2 px-4 text-gray-400 hover:text-white text-center"
          >
            Create New Post
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-[300px] w-full mx-auto py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <header className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl lg:mt-0 mt-[50px] lg:p-0 p-3 font-semibold">
            {getGreeting()}, {currentUser?.displayName || getNickname(currentUser?.email)}
          </h2>
          <Link to="/create">
            <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg">
              Create New Post
            </button>
          </Link>
        </header>

        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-xl font-bold mb-4">Your Posts</h3>
          {loading && <p className="text-gray-400">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <table className="w-full text-gray-400">
            <thead className="bg-gray-700">
              <tr>
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
                  <td className="py-3 px-4 flex justify-center space-x-2">
                    <Link to={`/edit/${post.id}`}>
                      <button className="bg-yellow-500 py-1 px-3 rounded">Edit</button>
                    </Link>
                    <button
                      className="bg-red-500 py-1 px-3 rounded"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-xl font-bold mb-4">Inspiring Quotes</h3>
          <p className="text-gray-400">"The only way to do great work is to love what you do." - Steve Jobs</p>
          <p className="text-gray-400 mt-2">"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill</p>
          <p className="text-gray-400 mt-2">"Do not wait to strike till the iron is hot, but make it hot by striking." - William Butler Yeats</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
