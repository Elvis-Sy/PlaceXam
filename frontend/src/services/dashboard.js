import axios from "../api/axios";

export const fetchDashboardData = async () => {
  const response = await axios.get("/dashboard"); // baseURL is set in ../api/axios
  return response.data?.data ?? response.data;
};

export const autoAssignStudents = async () => {
  const response = await axios.post("/assign-students");
  return response.data?.data ?? response.data;
};

export const autoAssignSupervisors = async () => {
  const response = await axios.post("/assign-supervisors");
  return response.data?.data ?? response.data;
};
