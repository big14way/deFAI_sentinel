import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Cache to store API responses and minimize API calls (free tier has rate limits)
interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheItem> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to check if cache is valid
const isCacheValid = (key: string): boolean => {
  if (!cache[key]) return false;
  return Date.now() - cache[key].timestamp < CACHE_DURATION;
};

// Helper function to get cached data or fetch new data
const getCachedOrFetch = async (url: string, params = {}): Promise<any> => {
  const cacheKey = url + JSON.stringify(params);
  
  if (isCacheValid(cacheKey)) {
    return cache[cacheKey].data;
  }
  
  try {
    const response = await axios.get(url, { params });
    
    // Cache the new data
    cache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching from CoinGecko API: ${url}`, error);
    throw error;
  }
};

/**
 * Get current price data for multiple tokens
 * @param tokenIds Array of CoinGecko token IDs
 * @param currency Currency to get prices in (default: usd)
 * @returns Object with token IDs as keys and prices as values
 */
export const getTokenPrices = async (
  tokenIds: string[],
  currency = 'usd'
): Promise<Record<string, number>> => {
  if (!tokenIds.length) return {};
  
  try {
    const data = await getCachedOrFetch(
      `${COINGECKO_API_URL}/simple/price`,
      {
        ids: tokenIds.join(','),
        vs_currencies: currency,
        include_24hr_change: true
      }
    );
    
    // Extract just the prices from the response
    const prices: Record<string, number> = {};
    
    for (const [id, priceData] of Object.entries(data)) {
      // @ts-ignore
      prices[id] = priceData[currency] || 0;
    }
    
    return prices;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    // Return empty object on error to prevent application crashes
    return {};
  }
};

/**
 * Get price change percentage for tokens
 * @param tokenIds Array of CoinGecko token IDs
 * @param days Number of days (1, 7, 14, 30, etc.)
 * @param currency Currency (default: usd)
 * @returns Object with token IDs as keys and price changes as values
 */
export const getTokenPriceChanges = async (
  tokenIds: string[],
  days: number,
  currency = 'usd'
): Promise<Record<string, number>> => {
  if (!tokenIds.length) return {};
  
  try {
    const data = await getCachedOrFetch(
      `${COINGECKO_API_URL}/coins/markets`,
      {
        ids: tokenIds.join(','),
        vs_currency: currency,
        price_change_percentage: `${days}d`,
        per_page: 250
      }
    );
    
    // Extract just the price changes from the response
    const priceChanges: Record<string, number> = {};
    
    for (const coin of data) {
      priceChanges[coin.id] = coin[`price_change_percentage_${days}d_in_currency`] || 0;
    }
    
    return priceChanges;
  } catch (error) {
    console.error(`Failed to fetch token price changes for ${days} days:`, error);
    // Return empty object on error to prevent application crashes
    return {};
  }
};

/**
 * Get market data for specific token
 * @param tokenId CoinGecko token ID
 * @returns Detailed market data for the token
 */
export const getTokenMarketData = async (tokenId: string): Promise<any> => {
  try {
    return await getCachedOrFetch(
      `${COINGECKO_API_URL}/coins/${tokenId}`,
      {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    );
  } catch (error) {
    console.error(`Failed to fetch market data for ${tokenId}:`, error);
    return null;
  }
};

/**
 * Get historical price data for a token
 * @param tokenId CoinGecko token ID
 * @param days Number of days of data to retrieve
 * @param currency Currency (default: usd)
 * @returns Array of price data points [timestamp, price]
 */
export const getTokenHistoricalData = async (
  tokenId: string,
  days: number,
  currency = 'usd'
): Promise<[number, number][]> => {
  try {
    const data = await getCachedOrFetch(
      `${COINGECKO_API_URL}/coins/${tokenId}/market_chart`,
      {
        vs_currency: currency,
        days: days,
        interval: days > 30 ? 'daily' : days > 7 ? '4h' : '1h'
      }
    );
    
    return data.prices || [];
  } catch (error) {
    console.error(`Failed to fetch historical data for ${tokenId}:`, error);
    return [];
  }
};

/**
 * Map ethereum addresses to CoinGecko IDs
 * This mapping is necessary because CoinGecko API uses IDs like 'ethereum' not addresses
 */
export const tokenAddressToGeckoId: Record<string, string> = {
  // Major tokens mapped by address
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum',    // WETH
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin', // WBTC
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',    // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',         // DAI
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',      // USDT
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',        // AAVE
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',     // UNI
  '0xc00e94cb662c3520282e6f5717214004a7f26888': 'compound-governance-token', // COMP
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker',       // MKR
  '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': 'yearn-finance', // YFI
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'matic-network', // MATIC
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',   // LINK
  '0x4fabb145d64652a948d72533023f6e7a623c7c53': 'binance-usd', // BUSD
  '0x2826D136F5630adA89C1678b64A61620Aab77Aea': 'swell-network'   // SWELL
};

/**
 * Get CoinGecko ID from token address
 */
export const getGeckoIdFromAddress = (address: string): string | null => {
  if (!address) return null;
  const normalizedAddress = address.toLowerCase();
  return tokenAddressToGeckoId[normalizedAddress] || null;
};

/**
 * Get token price by address
 */
export const getTokenPriceByAddress = async (address: string, currency = 'usd'): Promise<number | null> => {
  const geckoId = getGeckoIdFromAddress(address);
  if (!geckoId) return null;
  
  try {
    const prices = await getTokenPrices([geckoId], currency);
    return prices[geckoId] || null;
  } catch (error) {
    console.error(`Failed to fetch price for address ${address}:`, error);
    return null;
  }
};

/**
 * Get volatility score for a token based on price history
 * Calculates standard deviation of percent changes
 */
export const getTokenVolatilityScore = async (tokenId: string, days = 30): Promise<number> => {
  try {
    const priceData = await getTokenHistoricalData(tokenId, days);
    if (priceData.length < 2) return 0;
    
    // Calculate daily percent changes
    const percentChanges: number[] = [];
    for (let i = 1; i < priceData.length; i++) {
      const prevPrice = priceData[i-1][1];
      const currPrice = priceData[i][1];
      const percentChange = ((currPrice - prevPrice) / prevPrice) * 100;
      percentChanges.push(percentChange);
    }
    
    // Calculate standard deviation
    const mean = percentChanges.reduce((sum, val) => sum + val, 0) / percentChanges.length;
    const squaredDiffs = percentChanges.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize to a 0-100 scale (higher number means more volatile)
    // Based on typical crypto volatility ranges
    const normalizedVolatility = Math.min(100, Math.max(0, stdDev * 5));
    
    return normalizedVolatility;
  } catch (error) {
    console.error(`Failed to calculate volatility score for ${tokenId}:`, error);
    return 0;
  }
};

export default {
  getTokenPrices,
  getTokenPriceChanges,
  getTokenMarketData,
  getTokenHistoricalData,
  getTokenPriceByAddress,
  getGeckoIdFromAddress,
  getTokenVolatilityScore
}; 