import axios from "../api/axios";

export const getUsers = () => axios.get("/users").then((r) => r.data || r);
export const getUsersByRole = (role) => axios.get(`/users/${role}`).then((r) => r.data || r);
export const getUserById = (id) => axios.get(`/users/${id}`).then((r) => r.data || r);
export const createUser = (payload) => axios.post("/users", payload).then((r) => r.data || r);
export const updateUser = (id, payload) => axios.patch(`/users/${id}`, payload).then((r) => r.data || r);
export const deleteUser = (id) => axios.delete(`/users/${id}`).then((r) => r.data || r);
export const importUsers = (formData) => axios.post("/users/import", formData).then((r) => r.data || r);