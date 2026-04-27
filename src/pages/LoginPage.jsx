import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {assets} from "../assets/assets"
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  // style={{backgroundImage : `url(${assets.aiWithHuman})`}}
  return (
    <div className="min-h-screen flex items-center justify-center  bg-cover bg-center "  >
      
      
      <div className="w-full max-w-md p-8">
        <div className="card border-4 rounded-xl bg-white/20 backdrop-blur-md border-white/30 shadow-lg p-6">
          <h1 className="mb-8 text-center text-blue-600 text-2xl font-bold">Job Tracker</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="block mb-1">Username</label>
              <input
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="form-group mb-4">
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md mb-4 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link to='/signup' className="text-blue-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;