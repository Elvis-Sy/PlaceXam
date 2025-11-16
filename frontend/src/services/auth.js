// frontend/src/services/auth.js
import axios from "../api/axios";

/**
 * Auth API service
 * Exports:
 * - login(email, password) -> returns payload (includes accessToken, refreshToken, user)
 * - forgotPassword(email) -> returns server message
 * - resetPassword(token, newPassword) -> returns server message
 */

export const login = async (email, password) => {
  const res = await axios.post("/auth/login", { email, password });
  // backend wraps payload in { message, data } or sends data directly; normalize
  return res.data?.data ?? res.data;
};

export const forgotPassword = async (email) => {
  const res = await axios.post("/auth/forgot-password", { email });
  return res.data ?? res;
};

export const resetPassword = async (token, newPassword) => {
  const res = await axios.post("/auth/reset-password", { token, newPassword });
  return res.data ?? res;
};

export default {
  login,
  forgotPassword,
  resetPassword,
};