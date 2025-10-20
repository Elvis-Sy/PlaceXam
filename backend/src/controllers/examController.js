import { ExamService } from "../services/examService.js";

export const createExam = async (req, res) => {
  try {
    const result = await ExamService.createExam(req.body);
    res.status(201).json({
      message: "Examen créé avec succès",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllExams = async (req, res) => {
  try {
    const result = await ExamService.getAllExams();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExamById = async (req, res) => {
  try {
    const result = await ExamService.getExamById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await ExamService.updateExam(id, req.body);
    res.status(200).json({
      message: "Examen mis à jour avec succès",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const result = await ExamService.deleteExam(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
