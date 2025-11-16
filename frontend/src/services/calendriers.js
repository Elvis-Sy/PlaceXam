import axios from "../api/axios";

export const getAllCalendriers = (params) =>
  axios.get("/calendriers", { params }).then((r) => r.data || r);
export const getCalendrierById = (id) =>
  axios.get(`/calendriers/${id}`).then((r) => r.data || r);
export const createCalendrier = (payload) =>
  axios.post("/calendriers", payload).then((r) => r.data || r);
export const updateCalendrier = (id, payload) =>
  axios.patch(`/calendriers/${id}`, payload).then((r) => r.data || r);
export const deleteCalendrier = (id) =>
  axios.delete(`/calendriers/${id}`).then((r) => r.data || r);

// Server-side helper removed: this logic uses backend models (Calendrier, Exam) and should live in your Node/Sequelize backend.
// Keeping frontend service file limited to axios calls above to avoid top-level 'static' declaration and undefined model references.