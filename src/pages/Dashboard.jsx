import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.resumeId) {
      const timer = setTimeout(() => navigate('/resume'), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4">
      <div className="card text-center p-12">
        <h1 className="mb-4 text-blue-600 text-2xl font-bold">
          Welcome, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-500 mb-8">
          AI-Powered Job Tracker - Find your perfect job match
        </p>

        {!user?.resumeId && (
          <div className="bg-yellow-100 p-4 rounded mb-8">
            <p className="text-yellow-800">
              📄 Please upload your resume to get personalized job matches
            </p>
          </div>
        )}

        <div className="grid gap-4 mt-8 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          <div
            className="card cursor-pointer p-6"
            onClick={() => navigate('/jobs')}
          >
            <div className="text-2xl mb-4">💼</div>
            <h3 className="font-semibold mb-1">Browse Jobs</h3>
            <p className="text-gray-500 text-sm">Find jobs matched to your skills</p>
          </div>

          <div
            className="card cursor-pointer p-6"
            onClick={() => navigate('/applications')}
          >
            <div className="text-2xl mb-4">📋</div>
            <h3 className="font-semibold mb-1">My Applications</h3>
            <p className="text-gray-500 text-sm">Track your job applications</p>
          </div>

          <div
            className="card cursor-pointer p-6"
            onClick={() => navigate('/resume')}
          >
            <div className="text-2xl mb-4">📄</div>
            <h3 className="font-semibold mb-1">Upload Resume</h3>
            <p className="text-gray-500 text-sm">Update your resume</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;