import { MatiereService } from "../services/matiereService.js";

export const createMatiere = async (req, res) => {
  try {
    const matiere = await MatiereService.createMatiere(req.body);
    res.status(201).json({
        message: "Matière créée avec succès",
        data: matiere
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllMatieres = async (req, res) => {
  try {
    const matieres = await MatiereService.getAllMatieres();
    res.status(200).json(matieres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatiereById = async (req, res) => {
  try {
    const matiere = await MatiereService.getMatiereById(req.params.id);
    res.status(200).json(matiere);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateMatiere = async (req, res) => {
  try {
    const matiere = await MatiereService.updateMatiere(req.params.id, req.body);
    res.status(200).json({
        message: "Matière modifiée avec succès",
        data: matiere
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMatiere = async (req, res) => {
  try {
    const result = await MatiereService.deleteMatiere(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
