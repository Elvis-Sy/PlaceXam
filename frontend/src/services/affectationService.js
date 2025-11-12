import axios from "../api/axios";

export const getAllAffectations = () =>
  axios.get("/affectations").then((r) => r.data || r);

export const getAffectationsByExam = (examId) =>
  axios.get(`/affectations/exam/${examId}`).then((r) => r.data || r);

export const getAffectationsByStudent = (etudiantId) =>
  axios.get(`/affectations/etudiant/${etudiantId}`).then((r) => r.data || r);

export const verifyRoomAvailability = (salleId, dateDebut, dateFin) =>
  axios.get(`/affectations/disponibilite/${salleId}`, {
    params: { dateDebut, dateFin }
  }).then((r) => r.data || r);

export const getRoomOccupancy = (salleId, date) =>
  axios.get(`/affectations/salle/${salleId}/occupancy`, {
    params: { date }
  }).then((r) => r.data || r);

export const autoAffectStudents = (examId) =>
  axios.post(`/affectations/auto/${examId}`).then((r) => r.data || r);