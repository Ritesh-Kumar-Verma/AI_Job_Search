import React, { useState, useEffect } from "react";
import { jobsAPI, applicationsAPI } from "../services/api";

function JobFeed({ externalFilters, onFiltersChange }) {
  const [jobs, setJobs] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    datePosted: "all",
    jobType: [],
    workMode: [],
    location: "",
    skills: [],
    matchScore: "",
  });
  const [suggestedFilters, setSuggestedFilters] = useState(null);
  const [pendingApplication, setPendingApplication] = useState(null);

  useEffect(() => {
    if (externalFilters) {
      setFilters((prev) => {
        const newFilters = { ...prev };
        if (externalFilters.clearAll) {
          return {
            search: "",
            datePosted: "all",
            jobType: [],
            workMode: [],
            location: "",
            skills: [],
            matchScore: "",
          };
        }
        if (externalFilters.search !== undefined)
          newFilters.search = externalFilters.search;
        if (externalFilters.location !== undefined)
          newFilters.location = externalFilters.location;
        if (externalFilters.datePosted !== undefined)
          newFilters.datePosted = externalFilters.datePosted;
        if (externalFilters.matchScore !== undefined)
          newFilters.matchScore = externalFilters.matchScore;
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
      console.error("Error loading filter options:", err);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getFiltered(filters);
      const allJobs = res.data.jobs || [];
      setJobs(allJobs);
      const topMatches = [...allJobs]
        .filter((job) => job.matchScore >= 70)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);
      setBestMatches(topMatches);
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const res = await applicationsAPI.getAll();
      const applied = new Set(res.data.applications.map((app) => app.jobId));
      setAppliedJobs(applied);
    } catch (err) {
      console.error("Error loading applications:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSuggestedFilters(null);
    if (onFiltersChange) onFiltersChange({ ...filters, [key]: value });
  };

  const handleApply = (job) => {
    const jobUrl = job.url || job.redirectUrl || "#";
    window.open(jobUrl, "_blank");
    setPendingApplication(job);
  };

  const confirmApplication = async (response) => {
    if (!pendingApplication) return;
    const jobId = pendingApplication._id || pendingApplication.externalId;

    if (response === "yes" || response === "already") {
      try {
        await applicationsAPI.apply(jobId, {
          title: pendingApplication.title,
          company: pendingApplication.company,
          url: pendingApplication.url || pendingApplication.redirectUrl,
          matchScore: pendingApplication.matchScore,
        });
        setAppliedJobs((prev) => new Set([...prev, jobId]));
      } catch (err) {
        if (!err.response?.data?.message?.includes("Already applied"))
          console.error("Error applying:", err);
      }
    }
    setPendingApplication(null);
  };

  const applyFilters = () => loadJobs();

  const getScoreBadge = (score) => {
    if (score >= 70)
      return (
        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
          🟢 {score}%
        </span>
      );
    if (score >= 40)
      return (
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          🟡 {score}%
        </span>
      );
    return (
      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-sm">
        ⚪ {score}%
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      datePosted: "all",
      jobType: [],
      workMode: [],
      location: "",
      skills: [],
      matchScore: "",
    });
    setSuggestedFilters(null);
  };

  const getTimePosted = (date) => {
    const now = new Date();
    const postedDate = new Date(date);
    const diffMs = now - postedDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postedDate.toLocaleDateString();
  };

  return (
    <div className="p-4 lg:p-10">
      <h1 className="text-2xl font-bold text-white mb-8">🔍 Job Feed</h1>

      {/* Pending Application Modal */}
      {pendingApplication && (
        <div className="fixed inset-0 backdrop-blur-xl  flex items-center justify-center z-50  ">
          <div className="bg-[#0a192f] p-6 rounded-xl max-w-md w-full shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-2">
              📋 Application Status
            </h3>
            <p className="text-gray-400 mb-4">
              Did you apply to <strong>{pendingApplication.title}</strong> at{" "}
              <strong>{pendingApplication.company}</strong>?
            </p>
            <div className="flex flex-col gap-3 ">
              <button
                onClick={() => confirmApplication("yes")}
                className="bg-blue-500 text-white py-2 rounded hover:bg-blue-800 transition"
              >
                ✅ Yes, I Applied
              </button>
              <button
                onClick={() => confirmApplication("no")}
                className="bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
              >
                👀 No, Just Browsing
              </button>
              <button
                onClick={() => confirmApplication("already")}
                className="bg-yellow-100 text-yellow-800 py-2 rounded hover:bg-yellow-300 transition"
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
            <span className="text-gray-500 text-sm font-normal">
              ({bestMatches.length} high-scoring jobs)
            </span>
          </h2>
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] mb-4">
            {bestMatches.map((job) => (
              <div
                key={`best-${job._id || job.externalId}`}
                className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-base">{job.title}</div>
                    <div className="text-gray-700">{job.company}</div>
                  </div>
                  {getScoreBadge(job.matchScore)}
                </div>
                <div className="text-gray-700 mt-1">📍 {job.location}</div>
                {job.matchExplanation && (
                  <div className="text-green-700 text-sm mt-1">
                    {job.matchExplanation}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApply(job)}
                    disabled={appliedJobs.has(job._id || job.externalId)}
                    className={`flex-1 py-2 rounded text-white ${
                      appliedJobs.has(job._id || job.externalId)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {appliedJobs.has(job._id || job.externalId)
                      ? "✅ Applied"
                      : "✨ Apply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">📋 Filters</h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] mb-6">
          {/* Job Title */}
          <div>
            <label className="block mb-1 text-white">
              🔎 Job Title / Role
            </label>
            <input
              type="text"
              placeholder="e.g., React Developer"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="text-white w-full border border-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
          {/* Location */}
          <div>
            <label className="block mb-1 text-white">📍 Location</label>
            <input
              type="text"
              placeholder="e.g., London, Remote"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="text-white w-full border border-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
          {/* Date Posted */}
          <div>
            <label className="block mb-1 text-white">📅 Date Posted</label>
            <select
              value={filters.datePosted}
              onChange={(e) => handleFilterChange("datePosted", e.target.value)}
              className="w-full border border-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-[#0a192f]"
            >
              <option value="all">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
          {/* Match Score */}
          <div>
            <label className="block mb-1 text-white ">⭐ Match Score</label>
            <select
              value={filters.matchScore}
              onChange={(e) => handleFilterChange("matchScore", e.target.value)}
              className="w-full border border-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-[#0a192f]"
            >
              <option value="">All</option>
              <option value="high">High {">"}70%</option>
              <option value="medium">Medium 40-70%</option>
            </select>
          </div>
        </div>

        {/* Job Type */}
        <div className="mb-4 ">
          <label className="block font-semibold mb-2 text-white text-xl">
            💼 Job Type
          </label>
          <div className="flex flex-wrap gap-2 md:ml-2">
            {["Full-time", "Part-time", "Contract", "Internship"].map(
              (type) => (
                <label key={type} className="flex items-center gap-1 text-gray-400">
                  <input
                    type="checkbox"
                    checked={filters.jobType.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.jobType, type]
                        : filters.jobType.filter((t) => t !== type);
                      handleFilterChange("jobType", newTypes);
                    }}
                    className="accent-[#00bfff] w-4 h-4 "
                  />
                  {type}
                </label>
              ),
            )}
          </div>
        </div>

        {/* Work Mode */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-white text-xl">
            🏢 Work Mode
          </label>
          <div className="flex flex-wrap gap-2 ml-1">
            {["Remote", "Hybrid", "On-site"].map((mode) => (
              <label key={mode} className="flex items-center gap-1 text-gray-400">
                <input
                  type="checkbox"
                  checked={filters.workMode.includes(mode)}
                  onChange={(e) => {
                    const newModes = e.target.checked
                      ? [...filters.workMode, mode]
                      : filters.workMode.filter((m) => m !== mode);
                    handleFilterChange("workMode", newModes);
                  }}
                  className="accent-[#00bfff] w-4 h-4 ml-1"
                />
                {mode}
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <label className="block font-semibold mb-2  text-xl text-white">
            💡 Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions?.skills?.slice(0, 12).map((skill) => {
              const selected = filters.skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => {
                    const newSkills = selected
                      ? filters.skills.filter((s) => s !== skill)
                      : [...filters.skills, skill];
                    handleFilterChange("skills", newSkills);
                  }}
                  className={`px-3 py-1 rounded-full border transition ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-300 hover:border-blue-400 "
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
          {filters.skills.length > 0 && (
            <p className="mt-1 text-gray-300 text-md">
              Selected: {filters.skills.join(", ")}
            </p>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            🔍 Apply Filters ({jobs.length} jobs)
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-8 text-white">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">😔 No jobs found matching your filters.</p>
          <p>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id || job.externalId}
              className=" p-4 border-2 hover:border-blue-400  rounded-xl bg-[rgb(255,255,255,0.05)]  shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-lg"
            >
              <div className="flex justify-between items-start mb-2 ">
                <div className="flex-1">
                  <div className="font-medium text-lg text-white">{job.title}</div>
                  <div className="text-gray-300">{job.company}</div>
                  <div className="text-gray-300">📍 {job.location}</div>
                  <div className="text-gray-300 text-sm mt-1">
                    Posted {getTimePosted(job.postedDate)}
                  </div>
                </div>
                {job.matchScore !== undefined && getScoreBadge(job.matchScore)}
              </div>

              {/* Job Meta */}
              <div className="flex gap-2 flex-wrap mb-2">
                {job.jobType && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm">
                    💼 {job.jobType}
                  </span>
                )}
                {job.workMode && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-sm">
                    🏢 {job.workMode}
                  </span>
                )}
                {job.salary && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
                    💰 {job.salary}
                  </span>
                )}
              </div>

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div className="mb-2 ">
                  <p className="font-semibold text-gray-400 text-sm mb-1">
                    Required Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="text-gray-500 text-xs">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex lg:w-2/5 gap-2 max-w-80  mt-4">
                <button
                  onClick={() => handleApply(job)}
                  disabled={appliedJobs.has(job._id || job.externalId)}
                  className={`flex-1 flex justify-center py-2 rounded text-white ${
                    appliedJobs.has(job._id || job.externalId)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {appliedJobs.has(job._id || job.externalId)
                    ? "✅ Applied"
                    : " Apply"}
                </button>
                <a
                  href={job.url || job.redirectUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 text-center transition"
                >
                  🌐 View on Site
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobFeed;
