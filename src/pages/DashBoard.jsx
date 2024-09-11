import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Adjust the import based on your firebase configuration
import { FaArrowLeft } from 'react-icons/fa';

// Function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown Date';

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    // Try parsing if timestamp is in ISO format or another format
    date = new Date(timestamp);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return 'Unknown Date';

  return date.toLocaleDateString();
};

// Function to generate a nickname
const getNickname = (email) => {
  if (!email) return 'Cool Genius'; // Default nickname if email is not provided

  const coolNicknames = ['Explorer', 'Champ', 'Hero', 'Mastermind', 'Genius'];
  const emailDomain = email.split('@')[1]?.split('.')[0]; // Extract domain name from email

  const randomNickname = coolNicknames[Math.floor(Math.random() * coolNicknames.length)];

  return emailDomain ? `Mighty ${emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1)}` : `Cool ${randomNickname}`;
};

// Function to generate a greeting
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

  // Fetch posts from Firestore
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

  // Handle post deletion
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'post', id));
      setPosts(posts.filter(post => post.id !== id)); // Update state to remove the deleted post
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
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-10">
            <button
              onClick={() => navigate(-1)} // Go back to the previous page
              className="mr-2 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <FaArrowLeft />
            </button>
            <Link to="/">
              <h1 className="text-2xl font-bold">Write-Hub</h1>
            </Link>
          </div>
          <nav className="space-y-6">
            <Link to="/" className="block py-2 px-3 text-white bg-gray-700 rounded-md">
              Posts Overview
            </Link>
            <Link to="/create" className="block px-3 py-2 text-gray-400 hover:text-white">
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

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">
            {getGreeting()}, {currentUser?.displayName || getNickname(currentUser?.email)}
          </h2>
          <Link to="/create">
            <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg">Create New Post</button>
          </Link>
        </header>

        {/* Post Management Table */}
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-xl font-bold mb-4">Your Posts</h3>
          {loading && <p className="text-gray-400">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <table className="min-w-full text-gray-400">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-700">
                  <td className="py-3 px-4">{post.title}</td>
                  <td className="py-3 px-4">{formatDate(post.date)}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link to={`/edit/${post.id}`}>
                      <button className="bg-yellow-500 py-1 px-3 rounded">Edit</button>
                    </Link>
                    <button className="bg-red-500 py-1 px-3 rounded" onClick={() => handleDelete(post.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quotes Section */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-xl font-bold mb-4">Inspiring Quotes</h3>
          <p className="text-gray-400">
            "The only way to do great work is to love what you do." - Steve Jobs
          </p>
          <p className="text-gray-400 mt-2">
            "Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill
          </p>
          <p className="text-gray-400 mt-2">
            "Do not wait to strike till the iron is hot, but make it hot by striking." - William Butler Yeats
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
