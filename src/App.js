// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Auth Context
import Home from './pages/Home'; // Home component
import Sign from './components/Auth/Sign'; // Signup page
import Login from './components/Auth/Login'; // Login page
import DashBoard from './pages/DashBoard'; // Dashboard (protected)

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Sign />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashBoard />} /> {/* Protected */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
