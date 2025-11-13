import axios from "../api/axios";

export const getUsers = (params) =>
  axios.get("/users", { params }).then((r) => r.data || r);
export const getUserById = (id) => axios.get(`/users/${id}`).then((r) => r.data || r);
export const createUser = (payload) => axios.post("/users", payload).then((r) => r.data || r);
export const updateUser = (id, payload) => axios.patch(`/users/${id}`, payload).then((r) => r.data || r);
export const deleteUser = (id) => axios.delete(`/users/${id}`).then((r) => r.data || r);
export const importUsers = (formData) => axios.post("/users/import", formData).then((r) => r.data || r);