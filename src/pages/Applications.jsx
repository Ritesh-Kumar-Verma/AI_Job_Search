import React, { useState, useEffect } from 'react';
import { applicationsAPI } from '../services/api';

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationsAPI.getAll();
      // console.log(res.data)      
      setApplications(res.data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId, newStatus) => {
    try {
      console.log(typeof jobId)
      await applicationsAPI.updateStatus(jobId, newStatus);
      loadApplications();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const statusOptions = [
    { value: 'applied', label: 'Applied', icon: '📝', color: 'bg-blue-400', textColor: 'text-blue-300' },
    { value: 'interview', label: 'Interview', icon: '💼', color: 'bg-yellow-100', textColor: 'text-yellow-500' },
    { value: 'offer', label: 'Offer', icon: '🎉', color: 'bg-green-100', textColor: 'text-green-500' },
    { value: 'accepted', label: 'Accepted', icon: '✅', color: 'bg-green-100', textColor: 'text-green-800' },
    { value: 'rejected', label: 'Rejected', icon: '❌', color: 'bg-red-100', textColor: 'text-red-900' },
  ];

  const getStatusInfo = (status) => statusOptions.find(s => s.value === status) || statusOptions[0];

  const getStatusBadge = (status) => {
    const info = getStatusInfo(status);
    return (
      <span className={`${info.color} ${info.textColor} px-3 py-1 rounded text-sm font-semibold inline-flex items-center gap-1`}>
        {info.icon} {info.label}
      </span>
    );
  };

  const ApplicationTimeline = ({ app }) => {
    const timeline = [
      { status: 'applied', label: 'Applied', date: app.appliedAt || app.appliedDate },
      { status: 'in-progress', label: 'Interview', date: app.interviewDate },
      { status: 'offer', label: 'Offer/Decision', date: app.offerDate },
    ];

    const currentIndex = statusOptions.findIndex(s => s.value === app.status);

    return (
      <div className="flex items-center gap-2 py-4" >
        {timeline.map((step, index) => {
          const isActive = index <= currentIndex && app.status !== 'rejected';
          const isRejected = app.status === 'rejected';

          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center min-w-[80px]" >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[0.8rem] ${
                  isRejected && index > 0 ? 'bg-red-100 text-red-700' : isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isActive && !isRejected ? '✓' : index + 1}
                </div>
                <span className={`mt-1 text-[0.75rem] ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-[0.65rem] text-gray-400">
                    {new Date(step.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {index < timeline.length - 1 && (
                <div className={`flex-1 h-[2px] mb-6 ${index < currentIndex && !isRejected ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };



  return (
    <div className=" mx-auto p-4 lg:p-10 " >
      <h1 className=" text-white text-2xl font-bold">📋 My Applications</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="mx-auto spinner"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-500 text-lg">No applications yet.</p>
          <p className="text-gray-400 mt-2">Start applying to jobs from the Job Feed!</p>
        </div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="grid gap-4 mb-8 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
            {statusOptions.slice(0, 4).map(status => {
              const count = applications.filter(a => a.status === status.value).length;
              return (
                <div key={status.value} className="card text-center p-4">
                  <div className="text-2xl mb-2">{status.icon}</div>
                  <div className={`text-xl font-semibold ${status.textColor}`}>{count}</div>
                  <div className="text-sm text-gray-300">{status.label}</div>
                </div>
              );
            })}
          </div>

          {/* Applications List */}
          <div className="flex flex-col gap-4  " >
            {applications.map(app => (
              
              <div key={app.jobId} className=" p-6 border-2 border-transparent hover:border-white  rounded-xl bg-[rgb(255,255,255,0.05)]  shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="mb-1 text-lg text-white">{app.title || 'Unknown Job'}</h3>
                    <p className="text-gray-400 mb-2">{app.company ||  'Unknown Company'}</p>
                      
                      
                      
                      {/* to be added later */}
                    {/* <p className="text-xs text-gray-400">
                      Applied: {new Date(app.appliedAt || app.appliedDate).toLocaleDateString()}
                    </p> */}


                    
                  </div>
                  <div className="flex items-center gap-4">
                    {app.matchScore && (
                      <span className={`font-semibold px-2 py-1 rounded text-sm ${
                        app.matchScore > 70 ? 'text-green-700 bg-green-100' : 'text-yellow-800 bg-yellow-100'
                      }`}>
                        {app.matchScore}% Match
                      </span>
                    )}
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Timeline */}
                <ApplicationTimeline app={app} />

                {/* Actions */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2 gap-2 ">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-white">Update Status:</span>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.jobId, e.target.value)}
                      className="px-1 py-1 border border-gray-200 rounded text-sm text-white bg-[#0a192f]"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                    </div>
                  {app.url && (
                    <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" max-w-fit btn btn-secondary btn-small text-white border px-2  rounded"
                    >
                      View Job
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;