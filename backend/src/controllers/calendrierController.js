import { CalendrierService } from "../services/calendrierService.js";

export const createCalendrier = async (req, res) => {
  try {
    const result = await CalendrierService.createCalendrier(req.body);
    res.status(201).json({
      message: "Calendrier créé avec succès",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllCalendriers = async (req, res) => {
  try {
    const result = await CalendrierService.getAllCalendriers();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCalendrierById = async (req, res) => {
  try {
    const result = await CalendrierService.getCalendrierById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateCalendrier = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await CalendrierService.updateCalendrier(id, req.body);
    res.status(200).json({
      message: "Calendrier mis à jour avec succès",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCalendrier = async (req, res) => {
  try {
    const result = await CalendrierService.deleteCalendrier(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
