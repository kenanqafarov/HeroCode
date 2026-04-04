const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper to handle fetch + JSON + error
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data?: T; pagination?: any }> => {
  try {
    const response = await fetch(url, options);

    // Handle non-JSON responses gracefully
    if (!response.ok) {
      let errorMsg = 'Something went wrong';
      try {
        const errData = await response.json();
        errorMsg = errData.message || errorMsg;
      } catch { }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data; // Assume backend always returns { success, data?, message?, pagination? }
  } catch (error: any) {
    console.error('API Error:', error);
    throw error; // Let the caller handle with toast etc.
  }
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiRequest(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

// Blog API
export const blogAPI = {
  getAll: (
    page = 1,
    limit = 20,
    search = '',
    category = '',
    tag = ''
  ) => {
    let url = `${API_BASE}/blogs?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;

    return apiRequest(url); // GET by default
  },

  getById: (id: string) =>
    apiRequest(`${API_BASE}/blogs/${id}`),

  create: (data: any) =>
    apiRequest(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`${API_BASE}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),

  like: (id: string) =>
    apiRequest(`${API_BASE}/blogs/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }),

  addComment: (id: string, text: string) =>
    apiRequest(`${API_BASE}/blogs/${id}/comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    }),
};

// User API
export const userAPI = {
  getMe: () =>
    apiRequest(`${API_BASE}/users/me`, {
      headers: getAuthHeaders(),
    }),

  updateMe: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    learnedLanguages?: Array<{ language: string; level: 'beginner' | 'intermediate' | 'advanced' }>;
    xp?: number;
  }) =>
    apiRequest(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),

  updateCharacter: (data: {
    gender?: 'male' | 'female';
    emotion?: string;
    clothing?: string;
    hairColor?: string;
    skin?: string;
    clothingColor?: string;
    username?: string;
  }) =>
    apiRequest(`${API_BASE}/users/character`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),

  getBlogs: () =>
    apiRequest(`${API_BASE}/blogs/user/my-blogs`, {
      headers: getAuthHeaders(),
    }),
};