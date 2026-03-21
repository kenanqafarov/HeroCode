const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  register: (data: any) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
};

// Blog API
export const blogAPI = {
  getAll: (page = 1, limit = 20) =>
    fetch(`${API_BASE}/blogs?page=${page}&limit=${limit}`).then(r => r.json()),

  getById: (id: string) =>
    fetch(`${API_BASE}/blogs/${id}`).then(r => r.json()),

  create: (data: any) =>
    fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(r => r.json()),

  update: (id: string, data: any) =>
    fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(r => r.json()),

  delete: (id: string) =>
    fetch(`${API_BASE}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(r => r.json()),

  like: (id: string) =>
    fetch(`${API_BASE}/blogs/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(r => r.json()),

  addComment: (id: string, text: string) =>
    fetch(`${API_BASE}/blogs/${id}/comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text })
    }).then(r => r.json()),
};

// User API
export const userAPI = {
  getMe: () =>
    fetch(`${API_BASE}/users/me`, {
      headers: getAuthHeaders()
    }).then(r => r.json()),

  getBlogs: () =>
    fetch(`${API_BASE}/blogs/user/my-blogs`, {
      headers: getAuthHeaders()
    }).then(r => r.json()),
};
