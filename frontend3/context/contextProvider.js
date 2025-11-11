import { createContext, useState, useEffect } from "react";
import axios from "../api/axios"; // axios configuré
import jwtDecode from "jwt-decode";

export const ContextProvider = createContext();

export function ContextProvider({ children }) {

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true);

  // Decode token → récupérer ID / role / expiration
  const decodeToken = (token) => {
    try {
      return jwtDecode(token);
    } catch (e) {
      return null;
    }
  };

  // Charger les infos user si token valide
  useEffect(() => {
    async function init() {
      if (accessToken) {
        const payload = decodeToken(accessToken);
        if (payload?.exp * 1000 > Date.now()) {
          await fetchProfile(payload.id);
        } else {
          await refresh();
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  // 🔹 Récupérer le profil
  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`/auth/profile/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(res.data);
    } catch (error) {
      console.error("Profil error:", error);
    }
  };

  // 🔹 Login
  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setAccessToken(accessToken);
      setUser(user);

      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message };
    }
  };

  // 🔹 Signup
  const signup = async (fullname, email, password) => {
    try {
      const res = await axios.post("/auth/signup", {
        fullname, email, password
      });

      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setAccessToken(accessToken);
      setUser(user);

      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message };
    }
  };

  // 🔹 Récupérer un nouveau token si expiré
  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return logout();

      const res = await axios.post("/auth/refresh", { refreshToken });
      const { accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      setAccessToken(accessToken);

      const payload = decodeToken(accessToken);
      await fetchProfile(payload.id);

      return accessToken;
    } catch (err) {
      logout();
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setAccessToken(null);
  };


  return (
    <ContextProvider.Provider value={{
      user,
      accessToken,
      loading,
      login,
      signup,
      logout,
      refresh,
    }}>
      {children}
    </ContextProvider.Provider>
  );
}
