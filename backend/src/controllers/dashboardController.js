import { dashboardService } from "../services/dashboardService.js";

export const getDashboardData = async (req, res) => {
  try {
    const data = await dashboardService.fetchDashboardData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

export const autoAssignStudents = async (req, res) => {
  try {
    const result = await dashboardService.autoAssignStudents();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error auto-assigning students:", error);
    res.status(500).json({ error: "Failed to auto-assign students" });
  }
};

export const autoAssignSupervisors = async (req, res) => {
  try {
    const result = await dashboardService.autoAssignSupervisors();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error auto-assigning supervisors:", error);
    res.status(500).json({ error: "Failed to auto-assign supervisors" });
  }
};

export const getPlacesForExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const places = await dashboardService.fetchPlacesForExam(examId);
    res.status(200).json(places);
  } catch (error) {
    console.error("Error fetching places for exam:", error);
    res.status(500).json({ error: "Failed to fetch places for exam" });
  }
};