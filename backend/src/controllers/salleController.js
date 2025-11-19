import { SalleService } from "../services/salleService.js";

export const createSalle = async (req, res) => {
  try {
    const result = await SalleService.createSalle(req.body);
    res.status(201).json({
      message: "Salle créée avec succès",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllSalles = async (req, res) => {
  try {
    const result = await SalleService.getAllSalles();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSalleById = async (req, res) => {
  try {
    const result = await SalleService.getSalleById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateSalle = async (req, res) => {
  try {
    const result = await SalleService.updateSalle(req.params.id, req.body);
    res.status(200).json({
      message: "Salle mise à jour avec succès",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSalle = async (req, res) => {
  try {
    const result = await SalleService.deleteSalle(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// export const deletePlace = async (req, res) => {
//   try {
//     const { salleId, placeId } = req.params;
//     const result = await SalleService.deletePlace(salleId, placeId);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };
