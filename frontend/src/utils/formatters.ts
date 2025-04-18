/**
 * Formats a large number with appropriate suffix (K, M, B)
 * @param num Number to format
 * @param decimals Number of decimal places to show
 * @returns Formatted string
 */
export const formatLargeNumber = (num?: number, decimals = 2): string => {
  if (num === undefined || num === null) return 'N/A';
  
  if (num === 0) return '0';
  
  if (num < 1000) {
    return num.toFixed(decimals);
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const exponent = Math.min(Math.floor(Math.log10(num) / 3), suffixes.length - 1);
  const shortNum = (num / Math.pow(1000, exponent)).toFixed(decimals);
  
  return `$${shortNum}${suffixes[exponent]}`;
};

/**
 * Returns a color based on the risk score
 * @param score Risk score (0-100)
 * @returns Tailwind color class
 */
export const getRiskColor = (score: number): string => {
  if (score >= 80) return 'text-red-600';
  if (score >= 60) return 'text-orange-500';
  if (score >= 40) return 'text-yellow-500';
  if (score >= 20) return 'text-blue-500';
  return 'text-green-500';
};

/**
 * Truncates a string with ellipsis in the middle
 * @param str String to truncate
 * @param firstChars Number of characters to keep at the beginning
 * @param lastChars Number of characters to keep at the end
 * @returns Truncated string
 */
export const truncateString = (str: string, firstChars = 6, lastChars = 4): string => {
  if (!str) return '';
  if (str.length <= firstChars + lastChars) return str;
  
  return `${str.substring(0, firstChars)}...${str.substring(str.length - lastChars)}`;
};

/**
 * Format a timestamp to a readable date/time
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp && timestamp !== 0) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 * @param timestamp Unix timestamp in seconds
 * @returns Relative time string
 */
export const formatRelativeTime = (timestamp?: number): string => {
  if (!timestamp && timestamp !== 0) return 'N/A';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
};

/**
 * Format a number as currency (USD)
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return 'N/A';
  if (value === 0) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a risk score to a percentage with appropriate color class
 * @param score Risk score (0-100)
 * @returns Object with formatted value and color class
 */
export const formatRiskScore = (score?: number): { value: string, colorClass: string } => {
  if (score === undefined || score === null) {
    return { value: 'N/A', colorClass: 'text-gray-500' };
  }
  
  const percentage = Math.min(100, Math.max(0, score)).toFixed(0);
  
  let colorClass = 'text-green-500';
  if (score >= 70) {
    colorClass = 'text-red-500';
  } else if (score >= 40) {
    colorClass = 'text-yellow-500';
  }
  
  return { value: `${percentage}%`, colorClass };
};

/**
 * Truncate an Ethereum address
 * @param address Ethereum address
 * @returns Truncated address
 */
export const truncateAddress = (address?: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Alias for truncateAddress for compatibility
 * @param address Ethereum address
 * @returns Truncated address
 */
export const formatAddress = truncateAddress; 