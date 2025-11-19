import axios from "../api/axios";

export const getAllExams = (params) =>
  axios.get("/exams", { params }).then((r) => r.data || r);
export const getExamById = (id) => axios.get(`/exams/${id}`).then((r) => r.data || r);
export const createExam = (payload) => axios.post("/exams", payload).then((r) => r.data || r);
export const updateExam = (id, payload) => axios.patch(`/exams/${id}`, payload).then((r) => r.data || r);
export const deleteExam = (id) => axios.delete(`/exams/${id}`).then((r) => r.data || r);