import { format, formatDistanceToNow } from 'date-fns';

/**
 * Formats a timestamp for display
 * @param timestamp Unix timestamp or Date object
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number | Date | string): string => {
  if (!timestamp) return 'N/A';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000) 
    : (typeof timestamp === 'string' ? new Date(timestamp) : timestamp);
  
  return format(date, 'MMM d, yyyy h:mm a');
};

/**
 * Returns a relative time string (e.g., "3 hours ago")
 * @param timestamp Unix timestamp or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (timestamp: number | Date | string): string => {
  if (!timestamp) return 'N/A';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000) 
    : (typeof timestamp === 'string' ? new Date(timestamp) : timestamp);
  
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Returns a color based on risk score value
 * @param score Risk score (0-10)
 * @returns Hex color code
 */
export const getRiskColor = (score: number): string => {
  if (score >= 8) return '#e53e3e'; // Red for high risk
  if (score >= 6) return '#dd6b20'; // Orange for medium-high risk
  if (score >= 4) return '#d69e2e'; // Yellow for medium risk
  if (score >= 2) return '#38a169'; // Green for low-medium risk
  return '#2f855a'; // Dark green for low risk
};

/**
 * Truncates a string to specified length with ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number = 30): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Formats a number as currency
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (value === undefined || value === null) return 'N/A';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(value);
};

/**
 * Formats a large number with appropriate suffix (K, M, B)
 * @param value Number to format
 * @returns Formatted number string with suffix
 */
export const formatLargeNumber = (value: number): string => {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  
  return value.toString();
}; 