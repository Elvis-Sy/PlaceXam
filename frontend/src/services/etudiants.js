import axios from "../api/axios";

export const getEtudiants = () => 
  axios.get("/users/etudiant").then(r => r.data || r);

export const createEtudiant = (data) => 
  axios.post("/users", { ...data, role: "etudiant" }).then(r => r.data || r);

export const updateEtudiant = (id, data) => 
  axios.patch(`/users/${id}`, { ...data, role: "etudiant" }).then(r => r.data || r);

export const deleteEtudiant = (id) => 
  axios.delete(`/users/${id}`).then(r => r.data || r);

export const getEtudiantById = (id) => 
  axios.get(`/users/${id}`).then(r => r.data || r);