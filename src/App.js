// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Auth Context
import Home from './pages/Home'; // Home component
import Sign from './components/Auth/Sign'; // Signup page
import Login from './components/Auth/Login'; // Login page
import DashBoard from './pages/DashBoard'; // Dashboard (protected)
import Homepage from './pages/HomePage';
import PostDetails from './pages/PostDetails';
import BlogPage from './pages/Blog';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/create" element={<Home />} />
          <Route path="/signup" element={<Sign />} />
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/dashboard" element={<DashBoard />} /> {/* Protected */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
