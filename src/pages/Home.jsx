import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

const Home = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      let mediaURL = null;

      if (file) {
        const fileRef = ref(storage, `post/${user.uid}/${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        mediaURL = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(firestore, 'post'), {
        title,
        content,
        author: author || user.displayName || 'Anonymous',
        authorId: user.uid,
        createdAt: serverTimestamp(),
        likedBy: [],
        likes: 0,
        imageUrl: mediaURL || null,
        mediaType: file ? file.type : null,
      });

      setTitle('');
      setContent('');
      setAuthor('');
      setFile(null);
      setUploading(false);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post.');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 p-4 md:p-8 lg:p-12">
      <button
        onClick={() => navigate(-1)} 
        className="mb-6 py-2 px-4 mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition duration-300"
      >
        <FaArrowLeft />
      </button>
      <div className="flex flex-col justify-center items-center text-white">
        <div className="w-full max-w-lg lg:max-w-2xl bg-gray-700 rounded-lg shadow-md p-6 lg:p-12 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Create a Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="author" className="block text-gray-300">Author</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full h-12 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-300">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-300">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="file" className="block text-gray-300">Upload Image/Video</label>
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 flex justify-center items-center text-white font-bold rounded-md hover:bg-blue-700 transition duration-300"
              disabled={uploading}
            >
              {uploading ? <FaSpinner className="animate-spin" /> : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
