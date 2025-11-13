import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";
// compatibilité ESM/CJS pour jwt-decode
import * as jwt from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  const applyAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers = axios.defaults.headers || {};
      axios.defaults.headers.common = axios.defaults.headers.common || {};
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      if (axios.defaults.headers && axios.defaults.headers.common) {
        delete axios.defaults.headers.common["Authorization"];
      }
    }
  };

  // init axios header on mount
  useEffect(() => {
    const token = accessToken || localStorage.getItem("accessToken");
    if (token) applyAuthHeader(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decodeToken = (token) => {
    try {
      const fn = jwt?.default ?? jwt?.jwtDecode ?? jwt;
      return fn(token);
    } catch (e) {
      return null;
    }
  };

  // On mount: try to use stored access token, refresh if expired, then fetch profile
  useEffect(() => {
    async function init() {
      const token = accessToken || localStorage.getItem("accessToken");
      if (token) {
        const payload = decodeToken(token);
        if (payload && payload.exp * 1000 > Date.now()) {
          applyAuthHeader(token);
          setAccessToken(token);
          await fetchProfile(); // <-- appel sans id (backend utilise token)
        } else {
          await refresh();
        }
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Récupérer le profil — backend: GET /auth/profile (token-identifié)
  const fetchProfile = async () => {
    try {
      const res = await axios.get("/auth/profile");
      const data = res.data?.data ?? res.data;
      setUser(data);
      return data;
    } catch (error) {
      console.error("Profil error:", error);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      const payload = res.data?.data ?? res.data;

      const at = payload?.accessToken;
      const rt = payload?.refreshToken;
      const u = payload?.user ?? payload;

      if (!at || !rt) {
        throw new Error("Missing tokens in login response");
      }

      localStorage.setItem("accessToken", at);
      localStorage.setItem("refreshToken", rt);

      applyAuthHeader(at);
      setAccessToken(at);
      setUser(u);

      return u;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || err.message || "Erreur de connexion"
      );
    }
  };

  const signup = async (fullname, email, password, role) => {
    try {
      const res = await axios.post("/auth/signup", {
        fullname,
        email,
        password,
        role,
      });

      const payload = res.data?.data ?? res.data;
      const at = payload?.accessToken;
      const rt = payload?.refreshToken;
      const u = payload?.user;

      if (at && rt) {
        localStorage.setItem("accessToken", at);
        localStorage.setItem("refreshToken", rt);
        applyAuthHeader(at);
        setAccessToken(at);
        setUser(u);
      }

      return { ok: true, data: payload };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return null;
      }

      // backend expects { token } and route is /auth/refresh-token
      const res = await axios.post("/auth/refresh-token", { token: refreshToken });
      const payload = res.data?.data ?? res.data;
      const newAccessToken = payload?.accessToken ?? payload;

      if (!newAccessToken) {
        logout();
        return null;
      }

      localStorage.setItem("accessToken", newAccessToken);
      applyAuthHeader(newAccessToken);
      setAccessToken(newAccessToken);

      // fetch profile without passing id
      await fetchProfile();

      return newAccessToken;
    } catch (err) {
      logout();
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    applyAuthHeader(null);
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        signup,
        logout,
        refresh,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
