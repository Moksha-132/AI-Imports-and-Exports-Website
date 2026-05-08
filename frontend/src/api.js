const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiFetch = async (endpoint, options = {}) => {
  const userId = localStorage.getItem('user_id') || 1;
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('user_id', userId);
  
  const headers = { ...options.headers };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else if (!options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    const errorMsg = Array.isArray(error.detail) ? error.detail.map(e => e.msg).join(', ') : (error.detail || response.statusText);
    throw new Error(errorMsg);
  }
  return response.json();
};