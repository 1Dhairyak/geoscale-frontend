import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem("geo_token");
    const username = localStorage.getItem("geo_username");
    if (token && username) setUser({ token, username });
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("geo_token",         data.token);
    localStorage.setItem("geo_refresh_token", data.refreshToken);
    localStorage.setItem("geo_username",      username);
    setUser({ token: data.token, username });
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post("/auth/register", { username, email, password });
    if (data.token) {
      localStorage.setItem("geo_token",         data.token);
      localStorage.setItem("geo_refresh_token", data.refreshToken);
      localStorage.setItem("geo_username",      username);
      setUser({ token: data.token, username });
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("geo_refresh_token");
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch (_) {}
    }
    localStorage.removeItem("geo_token");
    localStorage.removeItem("geo_refresh_token");
    localStorage.removeItem("geo_username");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);