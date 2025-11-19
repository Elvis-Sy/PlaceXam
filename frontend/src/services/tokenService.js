export function saveTokens(access, refresh) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}
export function getAccessToken() {
  return localStorage.getItem("accessToken") || null;
}
export function getRefreshToken() {
  return localStorage.getItem("refreshToken") || null;
}
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
