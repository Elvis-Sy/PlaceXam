import SurveillantSideService from "../services/surveillantSideService.js";

export const getMySupervisions = async (req, res) => {
  try {
    const surveillantId = req.user?.id;
    const data = await SurveillantSideService.getMySupervisions(surveillantId);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMySalles = async (req, res) => {
  try {
    const surveillantId = req.user?.id;
    const data = await SurveillantSideService.getMySalles(surveillantId);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSalleOccupancy = async (req, res) => {
  try {
    const surveillantId = req.user?.id;
    const { salleId } = req.params;
    const { date } = req.query;
    const data = await SurveillantSideService.getSalleOccupancyForSurveillant(surveillantId, salleId, date);
    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};