const DEFAULT_REMOTE_API = 'https://schoolsystem-lyl7.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const API_URL = isLocalhost
  ? LOCAL_API
  : process.env.REACT_APP_API_URL || DEFAULT_REMOTE_API;

export default API_URL;

