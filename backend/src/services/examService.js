import Exam from "../models/examModel.js";
import Matiere from "../models/matiereModel.js";

export class ExamService {
  // Créer un examen
  static async createExam(data) {
    const { date, duree, matiereId } = data;

    if (!date || !duree || !matiereId)
      throw new Error("Les champs date, durée et matière sont requis");

    const exam = await Exam.create({ date, duree, matiereId });
    return exam;
  }

  // Récupérer tous les examens
  static async getAllExams() {
    return await Exam.findAll({
      include: [{ model: Matiere, attributes: ["label", "niveau"] }],
      order: [["date", "DESC"]],
    });
  }

  // Récupérer un examen par ID
  static async getExamById(id) {
    const exam = await Exam.findByPk(id, {
      include: [{ model: Matiere, attributes: ["label", "niveau"] }],
    });
    if (!exam) throw new Error("Examen introuvable");
    return exam;
  }

  // Modifier un examen
  static async updateExam(id, data) {
    const exam = await Exam.findByPk(id);
    if (!exam) throw new Error("Examen introuvable");

    await exam.update(data);
    return exam;
  }

  // Supprimer un examen
  static async deleteExam(id) {
    const exam = await Exam.findByPk(id);
    if (!exam) throw new Error("Examen introuvable");

    await exam.destroy();
    return { message: "Examen supprimé avec succès" };
  }
}
