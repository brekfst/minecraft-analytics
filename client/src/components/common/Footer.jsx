import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div className="md:col-span-1">
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="MCAnalytics Logo" 
                className="h-10 w-auto mr-3" 
              />
              <span className="text-xl font-bold text-gray-900">MCAnalytics</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Empowering Minecraft server owners with AI-driven insights and analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard/global" className="text-sm text-gray-500 hover:text-blue-600">
                  Global Dashboard
                </Link>
              </li>
              <li>
                <Link to="/servers" className="text-sm text-gray-500 hover:text-blue-600">
                  Servers
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://discord.gg/twHkTf7cHv" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/your-github-repo" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MCAnalytics. Powered by {' '}
            <a 
              href="https://discord.gg/twHkTf7cHv" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-500"
            >
              Grindnode
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
