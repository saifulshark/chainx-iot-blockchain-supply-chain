import axios from 'axios';

/*
 * Axios instance configured with the API base URL. The base URL can
 * be overridden in the .env file by setting VITE_API_BASE_URL. When
 * not set, it defaults to /api which works when the frontend is
 * served from the same origin as the backend via a proxy.
 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export default instance;