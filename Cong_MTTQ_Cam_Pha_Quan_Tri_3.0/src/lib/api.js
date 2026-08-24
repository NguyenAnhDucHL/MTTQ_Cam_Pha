// Basic API helper for the app

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const fetchApi = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If it's not FormData, set Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    removeAuthToken();
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  // Check if response is empty before parsing JSON
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    if (!response.ok) {
      if (response.status === 413) throw new Error('Dung lượng tệp tải lên quá lớn.');
      throw new Error(`Lỗi hệ thống (${response.status})`);
    }
    // If it's OK but not JSON, maybe return text
    return text;
  }

  if (!response.ok) {
    throw new Error(data?.error || `Lỗi hệ thống (${response.status})`);
  }

  return data;
};
