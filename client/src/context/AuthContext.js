import { createContext, createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest
} from "../services/userService.js";
import { getAuthToken } from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAuthToken()));
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setError(err.message);
      logoutRequest();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    setError("");
    const nextUser = await loginRequest(credentials);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signup = useCallback(async (payload) => {
    setError("");
    const nextUser = await signupRequest(payload);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, signup, logout, refresh, isAuthenticated: Boolean(user) }),
    [user, loading, error, login, signup, logout, refresh]
  );

  return createElement(AuthContext.Provider, { value }, children);
}
