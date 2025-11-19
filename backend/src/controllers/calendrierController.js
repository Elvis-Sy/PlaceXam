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
    // get combined persisted + virtual entries from the service
    const result = await CalendrierService.getAllCalendriers();

    // normalise to an array (service returns an array)
    let list = Array.isArray(result) ? result : result?.calendriers ?? [];

    // If requester is NOT admin, filter by their niveau
    const user = req.user;
    if (user && user.role !== "admin") {
      const userNiveau = user.niveau;
      list = list.filter((c) => {
        // exam object may be in .Exam or .exam, and matiere may be .Matiere or .matiere
        const exam = c.Exam ?? c.exam ?? null;
        const matiere = exam?.Matiere ?? exam?.matiere ?? null;
        const niveau = matiere?.niveau ?? null;
        return niveau === userNiveau;
      });
    }

    res.status(200).json(list);
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

export const getCalendrierByNiveau = async (req, res) => {
  try {
    const { niveau } = req.params;
    const result = await CalendrierService.getCalendriersByNiveau(niveau);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
