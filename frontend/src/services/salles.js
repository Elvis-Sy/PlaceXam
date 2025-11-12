import axios from "../api/axios";

export const getAllSalles = (params) =>
  axios.get("/salles", { params }).then((r) => r.data || r);
export const getSalleById = (id) => axios.get(`/salles/${id}`).then((r) => r.data || r);
export const createSalle = (payload) => axios.post("/salles", payload).then((r) => r.data || r);
export const updateSalle = (id, payload) => axios.patch(`/salles/${id}`, payload).then((r) => r.data || r);
export const deleteSalle = (id) => axios.delete(`/salles/${id}`).then((r) => r.data || r);
export const getSalleOccupancy = (salleId, date) =>
  axios.get(`/affectations/salle/${salleId}/occupancy`, { params: { date } }).then((r) => r.data || r);