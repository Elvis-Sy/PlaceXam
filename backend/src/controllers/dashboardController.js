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
    await dashboardService.autoAssignStudents();
    res.status(200).json({ message: "Students have been auto-assigned to seats" });
  } catch (error) {
    console.error("Error auto-assigning students:", error);
    res.status(500).json({ error: "Failed to auto-assign students" });
  }
};

export const autoAssignSupervisors = async (req, res) => {
  try {
    await dashboardService.autoAssignSupervisors();
    res.status(200).json({ message: "Supervisors have been auto-assigned to rooms" });
  } catch (error) {
    console.error("Error auto-assigning supervisors:", error);
    res.status(500).json({ error: "Failed to auto-assign supervisors" });
  }
};