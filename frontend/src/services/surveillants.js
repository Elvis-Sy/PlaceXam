import axios from "../api/axios";

export const getSurveillants = () => 
  axios.get("/users/surveillant").then(r => r.data || r);

export const createSurveillant = (data) => 
  axios.post("/users", { ...data, role: "surveillant" }).then(r => r.data || r);

export const updateSurveillant = (id, data) => 
  axios.patch(`/users/${id}`, { ...data, role: "surveillant" }).then(r => r.data || r);

export const deleteSurveillant = (id) => 
  axios.delete(`/users/${id}`).then(r => r.data || r);

export const getSurveillantById = (id) => 
  axios.get(`/users/${id}`).then(r => r.data || r);