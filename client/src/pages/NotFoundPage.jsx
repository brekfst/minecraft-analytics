import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-blue-100 p-4">
          <Search className="h-16 w-16 text-blue-600" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-gray-900">Page Not Found</h1>
        <p className="mt-3 text-xl text-gray-500">
          We couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
