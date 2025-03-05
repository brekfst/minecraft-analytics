// ErrorMessage.jsx
import React from 'react';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorMessage = ({ message, withLink = true }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <XCircle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
      <p className="text-gray-600 text-center mb-6">{message}</p>
      {withLink && (
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Homepage
        </Link>
      )}
    </div>
  );
};

export default ErrorMessage;