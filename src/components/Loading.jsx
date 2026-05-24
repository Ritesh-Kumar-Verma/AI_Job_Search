import React from 'react';

const Loading = ({text = 'Loading...', fullScreen = false }) => {
  
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/10 z-50'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      {/* Spinner */}
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-blue-600 h-10 w-10 border-4`}
        role="status"
        aria-label="loading"
      >
      </div>
      
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;