// In development (npm run dev), we use localhost
// In Docker, we use the VITE_API_URL environment variable which is set in the Docker environment
const isDevelopment = import.meta.env.DEV;
export const API_URL = isDevelopment ? 'http://localhost:8175' : (import.meta.env.VITE_API_URL || 'http://homeserver.local:8175'); 