// AdminStats.jsx
import React from 'react';
import { Server, Users, ShieldAlert, Star, Clock } from 'lucide-react';

const AdminStats = ({ stats }) => {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of the platform statistics and pending actions
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Server className="h-8 w-8 text-blue-600" />}
          title="Total Servers"
          value={stats.total_servers}
          subtitle={`${stats.active_servers} active, ${stats.pending_servers} pending`}
        />
        <StatCard
          icon={<Users className="h-8 w-8 text-green-600" />}
          title="Total Players"
          value={stats.total_players}
          subtitle={`Across all servers`}
        />
        <StatCard
          icon={<ShieldAlert className="h-8 w-8 text-amber-600" />}
          title="Pending Claims"
          value={stats.pending_claims}
          subtitle={`Awaiting approval`}
          actionLink="/admin/pending-claims"
          actionText="Review Claims"
        />
        <StatCard
          icon={<Star className="h-8 w-8 text-purple-600" />}
          title="Featured Servers"
          value={stats.featured_servers}
          subtitle={`Active promotions`}
          actionLink="/admin/featured-servers"
          actionText="Manage Featured"
        />
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Pending Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ActionCard
            icon={<Server className="h-6 w-6 text-blue-600" />}
            title="Server Approvals"
            count={stats.pending_servers}
            description="New server submissions requiring review and approval"
            link="/admin/pending-servers"
            buttonText="Review Servers"
          />
          <ActionCard
            icon={<ShieldAlert className="h-6 w-6 text-amber-600" />}
            title="Ownership Claims"
            count={stats.pending_claims}
            description="Claims from users wanting to manage their servers"
            link="/admin/pending-claims"
            buttonText="Review Claims"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, actionLink, actionText }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
        {actionLink ? (
            <Link
              to={actionLink}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {actionText}
            </Link>
          ) : (
            <span className="text-gray-500">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, count, description, link, buttonText }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-5 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {count}
            </span>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <Link
          to={link}
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};