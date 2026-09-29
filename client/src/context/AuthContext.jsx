import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guard against multiple simultaneous /me calls (e.g., React StrictMode double-invocation)
  const loadingRef = useRef(false);

  const loadUser = useCallback(async () => {
    // Prevent duplicate calls
    if (loadingRef.current) return;
    loadingRef.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    try {
      const res = await authAPI.me();
      setUser(res.data.user);
    } catch (err) {
      // Only clear token on 401 — NOT on network errors (don't log out on bad connection)
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      // 429 or server errors: keep existing session from localStorage if available
      else if (err?.response?.status === 429 || !err?.response) {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            setUser(null);
          }
        }
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // empty deps — this function is stable, only run on mount

  // Load user ONCE on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * login(email, password, requestedRole?)
   * Sends credentials + optional role to backend for verification.
   * Backend rejects if the user's actual role doesn't match.
   */
  const login = async (email, password, requestedRole) => {
    const res = await authAPI.login(email, password, requestedRole);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
