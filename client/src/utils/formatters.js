/**
 * Utility functions for formatting data in the UI
 */

// Format large numbers with commas (e.g., 1,234,567)
export const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';
    return Number(number).toLocaleString();
  };
  
  // Format date to local date string
  export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format date and time
  export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format time only
  export const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date with relative time (e.g., "5 minutes ago", "2 days ago")
  export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };
  
  // Format percentage with fixed decimal points
  export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
  };
  
  // Format latency with units (ms)
  export const formatLatency = (latency) => {
    if (latency === null || latency === undefined) return 'N/A';
    return `${Number(latency).toFixed(0)} ms`;
  };
  
  // Format players (e.g., "125 / 200")
  export const formatPlayers = (current, max) => {
    return `${formatNumber(current)} / ${formatNumber(max)}`;
  };
  
  // Truncate text with ellipsis if it exceeds max length
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength).trim()}...`;
  };
  
  // Format server uptime as percentage or status text
  export const formatUptime = (percentage) => {
    if (percentage === null || percentage === undefined) return 'Unknown';
    if (percentage >= 99.9) return 'Excellent (100%)';
    if (percentage >= 99) return 'Great (99%+)';
    if (percentage >= 95) return 'Good (95%+)';
    if (percentage >= 90) return 'Fair (90%+)';
    return `Poor (${formatPercentage(percentage)})`;
  };