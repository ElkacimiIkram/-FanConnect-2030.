const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function isJwtExpired(token) {
  if (!token || token.split('.').length < 2) {
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 < Date.now() - 5000;
  } catch {
    return true;
  }
}

export const authStorage = {
  getToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && isJwtExpired(token)) {
      this.clear();
      return null;
    }
    return token;
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      this.clear();
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  setSession({ token, user }) {
    this.setToken(token);
    this.setUser(user);
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  },
};