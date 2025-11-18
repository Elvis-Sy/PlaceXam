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
export const getCalendriersByNiveau = (niveau) =>
  axios.get(`/calendriers/niveau/${niveau}`).then((r) => r.data || r);