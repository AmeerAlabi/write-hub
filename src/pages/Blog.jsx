import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaThumbsUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '../components/Navbar';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
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

      // Sort posts by createdAt, handling cases where createdAt is undefined
      const sortedPosts = postsData.sort((a, b) => {
        const aCreatedAt = a.createdAt?.seconds || 0;  // Fallback to 0 if missing
        const bCreatedAt = b.createdAt?.seconds || 0;
        return bCreatedAt - aCreatedAt;
      });

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      setError("Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (userLikes.has(postId)) {
      return;
    }

    try {
      const postRef = doc(db, 'post', postId);
      const post = posts.find(post => post.id === postId);
      if (post) {
        await updateDoc(postRef, {
          likes: post.likes + 1
        });
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        setUserLikes(new Set([...userLikes, postId]));
        localStorage.setItem('userLikes', JSON.stringify([...userLikes, postId]));
      }
    } catch (error) {
      console.error("Error liking post: ", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    const storedLikes = JSON.parse(localStorage.getItem('userLikes')) || [];
    setUserLikes(new Set(storedLikes));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header>
        <Navbar />
      </header>
      <main className="container mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-4xl font-bold mb-8 text-center p-[7px]">Welcome to the Blog</h2>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105">
                <Link key={post.id} to={`/post/${post.id}`}>
                  <img 
                    src={post.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image+Available'} 
                    alt={post.title} 
                    className="w-full h-48 object-cover" 
                  />
                </Link>
                <div className="p-4">
                  <h3 className="text-2xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-400 mb-4">{post.content.substring(0, 150)}...</p>
                  <p className="text-gray-500 text-sm">By {post.author || 'Anonymous'} {formatDistanceToNow(new Date(post.createdAt?.seconds * 1000 || 0), { addSuffix: true })}</p>
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FaThumbsUp className="w-5 h-5" />
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
