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
 * Format a Unix timestamp to a human-readable date string
 */
export function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a Unix timestamp to a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number | undefined): string {
  if (!timestamp) return 'N/A';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  
  return formatTimestamp(timestamp);
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format an address to a shortened form
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
} 