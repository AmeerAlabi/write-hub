// src/pages/Logout.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-black to-blue-900">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">You are now logged out</h2>
        <p className="text-gray-700 mb-6">You have been successfully logged out.</p>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default Logout;
