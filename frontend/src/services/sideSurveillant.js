import axios from "../api/axios";

export const getMySupervisions = () => axios.get("/me/supervisions").then((r) => r.data || r);
export const getMySalles = () => axios.get("/me/salles").then((r) => r.data || r);
export const getSalleOccupancy = (salleId, date) =>
  axios.get(`/me/salle/${salleId}/occupancy`, { params: { date } }).then((r) => r.data || r);