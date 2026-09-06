// Basic API helper for the app

export const getAuthToken = () => {
  // Token is now stored in HttpOnly cookie, so we can't access it via JS.
  // We return a dummy true value if we think the user is logged in, 
  // but true validation happens on the server.
  // To keep frontend logic simple for now, we just rely on API 401 errors.
  return true;
};

export const setAuthToken = (token) => {
  // Deprecated: Token is now set via HttpOnly cookie from the backend
};

export const removeAuthToken = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.error('Logout error', e);
  }
};

export const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    ...options.headers,
  };

  // If it's not FormData, set Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Automatically send HttpOnly cookies
  });

  if ((response.status === 401 || response.status === 403) &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/logout') &&
    !endpoint.includes('/auth/me')) {
    await removeAuthToken();
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
