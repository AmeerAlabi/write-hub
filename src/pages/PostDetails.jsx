import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaArrowLeft } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const DEFAULT_IMAGE_URL = "https://via.placeholder.com/600x400?text=No+Image+Available";

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate(); 

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'post', id);
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          setPost(postSnapshot.data());
        } else {
          setError('Post not found');
        }
      } catch (error) {
        console.error("Error fetching post: ", error);
        setError("Failed to fetch post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">{error}</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
     <Navbar />
      <main className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          <FaArrowLeft />
        </button>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <img 
            src={post.imageUrl || DEFAULT_IMAGE_URL} 
            alt={post.title} 
            className="w-full h-64 object-cover rounded-lg mb-6" 
          />
          <p className="text-xl">{post.content}</p>
          <Link to="/blog" className="mt-6 inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg">
            <FaArrowLeft /> Back to Blog
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PostDetails;
