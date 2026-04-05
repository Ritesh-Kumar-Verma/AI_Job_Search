import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../services/api';

function ResumeUpload() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadedResume, setUploadedResume] = useState(null);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const res = await resumeAPI.get();
      setUploadedResume(res.data);
    } catch (err) {}
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = ['application/pdf', 'text/plain'].includes(file.type);
      if (isValid) {
        setResume(file);
        setError('');
      } else {
        setError('Only PDF and TXT files are allowed');
        setResume(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resume) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resumeAPI.upload(resume);
      setMessage('Resume uploaded successfully!');
      setResume(null);
      loadResume();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto " >
      <div className="max-w-xl mx-auto h-screen bg-white p-6 rounded shadow " style={{background:`linear-gradient(135deg, #0a192f, #020c1b, #1c1f2f) `}}>
        <h1 className="mb-6 text-blue-600 text-2xl font-semibold">Upload Your Resume</h1>

        <p className="text-gray-500 mb-8">
          Upload a PDF or text file. We'll extract skills and match you with relevant jobs.
        </p>

        {uploadedResume && (
          <div className="bg-green-100 p-4 rounded mb-8">
            <p className="text-green-800 mb-2">
              ✓ Current Resume: <strong>{uploadedResume.fileName}</strong>
            </p>
            {uploadedResume.skills && uploadedResume.skills.length > 0 && (
              <p className="text-green-800 text-sm">
                Skills detected: {uploadedResume.skills.join(', ')}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label htmlFor="resume" className="block mb-2 font-medium">
              Select Resume File
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="w-full p-4 border-2 border-dashed border-blue-600 rounded"
            />
            {resume && (
              <p className="mt-2 text-gray-500 text-sm">Selected: {resume.name}</p>
            )}
          </div>

          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
          {message && <div className="text-green-500 mb-4 text-sm">{message}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            disabled={!resume || loading}
          >
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResumeUpload;