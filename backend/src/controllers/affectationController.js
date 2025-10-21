import { AffectationService } from "../services/affectationService.js";


export const autoAffecter = async (req, res) => {
    try {
        const { examId } = req.params;
        const result = await AffectationService.autoAffecter(examId);
        res.status(201).json({
        message: "Affectation automatique réussie",
        ...result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getAll = async (req, res) => {
    try {
        const affectations = await AffectationService.getAffectations();
        res.status(200).json(affectations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const affectations = await AffectationService.getAffectationsByExam(examId);
        res.status(200).json(affectations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getByEtudiant = async (req, res) => {
    try {
        const { etudiantId } = req.params;
        const affectations = await AffectationService.getAffectationsByEtudiant(etudiantId);
        res.status(200).json(affectations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const verifierSalle = async (req, res) => {
    try {
        const { salleId } = req.params;
        const { dateDebut, dateFin } = req.query;

        const libre = await AffectationService.verifierDisponibiliteSalle(salleId, dateDebut, dateFin);
        res.status(200).json({ salleId, libre });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

