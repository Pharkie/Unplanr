const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async getAuthUrl() {
    return this.fetch('/api/auth/google');
  }

  async checkAuthStatus() {
    return this.fetch('/api/auth/status');
  }

  async logout() {
    return this.fetch('/api/auth/logout', { method: 'POST' });
  }

  // Calendar endpoints
  async getEvents(maxResults = 100) {
    return this.fetch(`/api/calendar/events?maxResults=${maxResults}`);
  }

  async deleteEvents(eventIds: string[]) {
    return this.fetch('/api/calendar/delete', {
      method: 'POST',
      body: JSON.stringify({ eventIds }),
    });
  }
}

export const api = new ApiService();
