import { SupervisionService } from "../services/supervisionService.js";


export const createSupervision = async (req, res) => {
    try {
        const supervision = await SupervisionService.createSupervision(req.body);
        res.status(201).json(supervision);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const assignerPlusieurs = async (req, res) => {
    try {
        const { examId } = req.params;
        const { surveillantIds } = req.body; // tableau d’UUIDs
        const result = await SupervisionService.assignerPlusieursSurveillants(examId, surveillantIds);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getAllSupervisions = async (req, res) => {
    try {
        const supervisions = await SupervisionService.getAllSupervisions();
        res.status(200).json(supervisions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const supervisions = await SupervisionService.getByExam(examId);
        res.status(200).json(supervisions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getBySurveillant = async (req, res) => {
    try {
        const { surveillantId } = req.params;
        const supervisions = await SupervisionService.getBySurveillant(surveillantId);
        res.status(200).json(supervisions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const updateSupervision = async (req, res) => {
    try {
        const { id } = req.params;
        const supervision = await SupervisionService.updateSupervision(id, req.body);
        res.status(200).json(supervision);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const deleteSupervision = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SupervisionService.deleteSupervision(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
