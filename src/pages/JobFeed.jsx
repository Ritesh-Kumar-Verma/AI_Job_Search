import React, { useState, useEffect } from 'react';
import { jobsAPI, applicationsAPI } from '../services/api';

function JobFeed({ externalFilters, onFiltersChange }) {
  const [jobs, setJobs] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    datePosted: 'all',
    jobType: [],
    workMode: [],
    location: '',
    skills: [],
    matchScore: '',
  });
  const [suggestedFilters, setSuggestedFilters] = useState(null);
  const [pendingApplication, setPendingApplication] = useState(null);

  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => {
        const newFilters = { ...prev };
        if (externalFilters.clearAll) {
          return {
            search: '',
            datePosted: 'all',
            jobType: [],
            workMode: [],
            location: '',
            skills: [],
            matchScore: '',
          };
        }
        if (externalFilters.search !== undefined) newFilters.search = externalFilters.search;
        if (externalFilters.location !== undefined) newFilters.location = externalFilters.location;
        if (externalFilters.datePosted !== undefined) newFilters.datePosted = externalFilters.datePosted;
        if (externalFilters.matchScore !== undefined) newFilters.matchScore = externalFilters.matchScore;
        if (externalFilters.workMode !== undefined) {
          newFilters.workMode = Array.isArray(externalFilters.workMode)
            ? externalFilters.workMode
            : [externalFilters.workMode].filter(Boolean);
        }
        if (externalFilters.jobType !== undefined) {
          newFilters.jobType = Array.isArray(externalFilters.jobType)
            ? externalFilters.jobType
            : [externalFilters.jobType].filter(Boolean);
        }
        if (externalFilters.skills !== undefined) {
          newFilters.skills = Array.isArray(externalFilters.skills)
            ? externalFilters.skills
            : [externalFilters.skills].filter(Boolean);
        }
        return newFilters;
      });
      setSuggestedFilters(externalFilters);
    }
  }, [externalFilters]);

  useEffect(() => {
    if (externalFilters) loadJobs();
  }, [filters]);

  useEffect(() => {
    loadJobs();
    loadApplications();
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const res = await jobsAPI.getFilterOptions();
      setFilterOptions(res.data);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getFiltered(filters);
      const allJobs = res.data.jobs || [];
      setJobs(allJobs);
      const topMatches = [...allJobs]
        .filter(job => job.matchScore >= 70)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);
      setBestMatches(topMatches);
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const res = await applicationsAPI.getAll();
      const applied = new Set(res.data.applications.map(app => app.jobId));
      setAppliedJobs(applied);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSuggestedFilters(null);
    if (onFiltersChange) onFiltersChange({ ...filters, [key]: value });
  };

  const handleApply = job => {
    const jobUrl = job.url || job.redirectUrl || '#';
    window.open(jobUrl, '_blank');
    setPendingApplication(job);
  };

  const confirmApplication = async response => {
    if (!pendingApplication) return;
    const jobId = pendingApplication._id || pendingApplication.externalId;

    if (response === 'yes' || response === 'already') {
      try {
        await applicationsAPI.apply(jobId, {
          title: pendingApplication.title,
          company: pendingApplication.company,
          url: pendingApplication.url || pendingApplication.redirectUrl,
          matchScore: pendingApplication.matchScore,
        });
        setAppliedJobs(prev => new Set([...prev, jobId]));
      } catch (err) {
        if (!err.response?.data?.message?.includes('Already applied')) console.error('Error applying:', err);
      }
    }
    setPendingApplication(null);
  };

  const applyFilters = () => loadJobs();

  const getScoreBadge = score => {
    if (score >= 70) return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">🟢 {score}%</span>;
    if (score >= 40) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-sm">🟡 {score}%</span>;
    return <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-sm">⚪ {score}%</span>;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      datePosted: 'all',
      jobType: [],
      workMode: [],
      location: '',
      skills: [],
      matchScore: '',
    });
    setSuggestedFilters(null);
  };

  const getTimePosted = date => {
    const now = new Date();
    const postedDate = new Date(date);
    const diffMs = now - postedDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postedDate.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">🔍 Job Feed</h1>

      {/* Pending Application Modal */}
      {pendingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">📋 Application Status</h3>
            <p className="text-gray-600 mb-4">
              Did you apply to <strong>{pendingApplication.title}</strong> at <strong>{pendingApplication.company}</strong>?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => confirmApplication('yes')}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                ✅ Yes, I Applied
              </button>
              <button
                onClick={() => confirmApplication('no')}
                className="bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
              >
                👀 No, Just Browsing
              </button>
              <button
                onClick={() => confirmApplication('already')}
                className="bg-yellow-100 text-yellow-800 py-2 rounded hover:bg-yellow-200 transition"
              >
                📝 Applied Earlier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestion */}
      {suggestedFilters && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded mb-6">
          💡 AI Suggestion applied! Showing results based on your preferences.
        </div>
      )}

      {/* Best Matches */}
      {bestMatches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-green-700 flex items-center gap-2 mb-2 font-semibold">
            🏆 Best Matches For You
            <span className="text-gray-500 text-sm font-normal">({bestMatches.length} high-scoring jobs)</span>
          </h2>
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] mb-4">
            {bestMatches.map(job => (
              <div key={`best-${job._id || job.externalId}`} className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-base">{job.title}</div>
                    <div className="text-gray-700">{job.company}</div>
                  </div>
                  {getScoreBadge(job.matchScore)}
                </div>
                <div className="text-gray-700 mt-1">📍 {job.location}</div>
                {job.matchExplanation && <div className="text-green-700 text-sm mt-1">{job.matchExplanation}</div>}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApply(job)}
                    disabled={appliedJobs.has(job._id || job.externalId)}
                    className={`flex-1 py-2 rounded text-white ${
                      appliedJobs.has(job._id || job.externalId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {appliedJobs.has(job._id || job.externalId) ? '✅ Applied' : '✨ Apply'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">📋 Filters</h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] mb-6">
          <div>
            <label className="block mb-1">🔎 Job Title / Role</label>
            <input
              type="text"
              placeholder="e.g., React Developer"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1">📍 Location</label>
            <input
              type="text"
              placeholder="e.g., London, Remote"
              value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1">📅 Date Posted</label>
            <select
              value={filters.datePosted}
              onChange={e => handleFilterChange('datePosted', e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">⭐ Match Score</label>
            <select
              value={filters.matchScore}
              onChange={e => handleFilterChange('matchScore', e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="high">High {'>'}70%</option>
              <option value="medium">Medium 40-70%</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobFeed;