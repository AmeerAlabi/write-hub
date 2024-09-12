import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      navigate("/"); 
    } catch (error) {
      setError(error.message); 
    }
    setLoading(false);
  };

  return (
  <div className=" w-full bg-gray-700 h-screen ">
    <div className="max-w-md mx-auto   p-6 bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Sign Up - Write Hub</h2>
      {error && <p className="text-red-400 text-center mb-4">{error}</p>} {/* Display error messages */}
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-400">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-400">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            required
          />
        </div>
        <div className="mb-4 relative">
          <label htmlFor="password" className="block text-gray-400">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md pr-10 focus:outline-none focus:border-blue-500 transition duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white transition duration-300"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          type="submit"
          className={`w-full py-2 ${
            loading ? "bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-bold rounded-md flex items-center justify-center transition duration-300`}
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Sign Up'}
        </button>
      </form>
    </div>
    </div>
  );
};

export default SignUp;
