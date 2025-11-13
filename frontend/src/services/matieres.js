import axios from "../api/axios";

export const getAllMatieres = (params) =>
  axios.get("/matieres", { params }).then((r) => r.data || r);
export const getMatiereById = (id) => axios.get(`/matieres/${id}`).then((r) => r.data || r);
export const createMatiere = (payload) => axios.post("/matieres", payload).then((r) => r.data || r);
export const updateMatiere = (id, payload) => axios.patch(`/matieres/${id}`, payload).then((r) => r.data || r);
export const deleteMatiere = (id) => axios.delete(`/matieres/${id}`).then((r) => r.data || r);
export const importMatieres = (formData) => axios.post("/matieres/import", formData).then((r) => r.data || r);