import axios from 'axios';

// Free CORS proxies that can be used
const corsProxies = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

// Index for the current proxy being used
let currentProxyIndex = 0;

// Get the current proxy URL
const getCurrentProxy = () => corsProxies[currentProxyIndex];

// Switch to the next proxy if the current one fails
const switchToNextProxy = () => {
  currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
  return getCurrentProxy();
};

// Make a proxied API request with automatic retry using different proxies
export const makeProxiedRequest = async (url, options = {}) => {
  let attempts = 0;
  const maxAttempts = corsProxies.length;
  
  while (attempts < maxAttempts) {
    try {
      const proxy = getCurrentProxy();
      const proxiedUrl = `${proxy}${url}`;
      
      console.log(`Attempting request via proxy: ${proxiedUrl}`);
      const response = await axios({
        url: proxiedUrl,
        ...options
      });
      
      return response;
    } catch (error) {
      console.error(`Proxy request failed: ${error.message}`);
      attempts++;
      
      if (attempts < maxAttempts) {
        console.log('Switching to next proxy...');
        switchToNextProxy();
      } else {
        console.error('All proxy attempts failed');
        throw error;
      }
    }
  }
};

// Function to create a URL with query parameters
export const createUrlWithParams = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

const apiProxy = {
  makeProxiedRequest,
  createUrlWithParams
};

export default apiProxy;
