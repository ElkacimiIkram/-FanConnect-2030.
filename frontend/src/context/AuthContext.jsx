import { createContext, useContext, useMemo, useState } from 'react';
import { authStorage } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authStorage.getToken());
  const [user, setUser] = useState(() => authStorage.getUser());

  const login = (authData) => {
    authStorage.setSession({
      token: authData.token,
      user: authData.user,
    });
    setToken(authData.token);
    setUser(authData.user);
  };

  const logout = () => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}