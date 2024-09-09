import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa'; // Import icons

const Home = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [posts, setPosts] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      await addDoc(collection(firestore, 'post'), {
        title,
        content,
        author: author || user.displayName || 'Anonymous',
        authorId: user.uid,
        createdAt: serverTimestamp(),
        likedBy: [],
        likes: 0,
      });
      setTitle('');
      setContent('');
      setAuthor('');
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post.');
    }
  };

  const handleLike = async (postId, likedBy, currentUserId, likes) => {
    const postRef = doc(firestore, 'post', postId);
    if (!Array.isArray(likedBy)) {
      console.error('likedBy is not an array');
      return;
    }
    if (likedBy.includes(currentUserId)) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(currentUserId),
        likes: likes - 1,
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(currentUserId),
        likes: likes + 1,
      });
    }
  };

  useEffect(() => {
    const q = query(collection(firestore, 'post'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt ? data.createdAt.toDate() : null; // Convert Firestore Timestamp to Date
        return { ...data, createdAt, id: doc.id };
      });
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-black to-blue-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome, {currentUser?.displayName || currentUser?.email}</h1>
      <button
        onClick={handleLogout}
        className="mb-6 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300"
      >
        Logout
      </button>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-black">
        <h2 className="text-2xl font-bold mb-4 text-center">Create a Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="author" className="block text-gray-700">Author</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition duration-300"
          >
            Create Post
          </button>
        </form>
      </div>

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Recent Posts</h2>
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4 mb-4 text-black">
            <h3 className="text-xl font-bold">{post.title}</h3>
            <p className="text-gray-700">{post.content}</p>
            <p className="text-sm text-gray-500">
              By {post.author} on {post.createdAt ? formatDistanceToNow(post.createdAt, { addSuffix: true }) : "Unknown date"}
            </p>
            <p className="text-sm text-gray-500">Likes: {post.likes}</p>
            <button
              onClick={() => handleLike(post.id, post.likedBy, auth.currentUser.uid, post.likes)}
              className="flex items-center mt-2 py-1 px-4 transition duration-300"
              style={{ color: post.likedBy?.includes(auth.currentUser.uid) ? 'blue' : 'gray' }} // Change color based on like status
            >
              {post.likedBy?.includes(auth.currentUser.uid) ? <FaThumbsUp /> : <FaRegThumbsUp />} {/* Change icon based on like status */}
              <span className="ml-2">{post.likedBy?.includes(auth.currentUser.uid) ? 'Unlike' : 'Like'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
