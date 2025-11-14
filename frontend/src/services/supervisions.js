import axios from "../api/axios";

export const getAllSupervisions = () => axios.get("/supervisions").then((r) => r.data || r);
export const createSupervision = (payload) => axios.post("/supervisions", payload).then((r) => r.data || r);
export const updateSupervision = (id, payload) => axios.patch(`/supervisions/${id}`, payload).then((r) => r.data || r);
export const deleteSupervision = (id) => axios.delete(`/supervisions/${id}`).then((r) => r.data || r);