import { Op } from "sequelize";
import Supervision from "../models/supervisionModel.js";
import User from "../models/userModel.js";
import Exam from "../models/examModel.js";
import Calendrier from "../models/calendrierModel.js";
import Salle from "../models/salleModel.js";

export class SupervisionService {
  
  // Créer une supervision unique
  static async createSupervision({ examId, surveillantId }) {
    const surveillant = await User.findByPk(surveillantId);
    if (!surveillant || surveillant.role !== "surveillant") {
      throw new Error("Surveillant invalide ou inexistant");
    }

    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error("Examen introuvable");

    const isConflict = await getConflict(examId, surveillantId);

    if (isConflict) {
      throw new Error(
        "Ce surveillant est déjà affecté à un autre examen à cette date et heure."
      );
    }

    return await Supervision.create({ examId, surveillantId });
  }

  // Créer plusieurs supervisions d’un coup
  static async assignerPlusieursSurveillants(examId, surveillantIds = []) {
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error("Examen introuvable");

    // Filtrer uniquement les surveillants valides
    const surveillants = await User.findAll({
      where: { id: surveillantIds, role: "surveillant" },
    });

    if (!surveillants.length) throw new Error("Aucun surveillant valide trouvé");

    // Vérifier s’ils ne sont pas déjà affectés à cet examen
    const existants = await Supervision.findAll({
      where: { examId },
      attributes: ["surveillantId"],
    });

    const existantsIds = existants.map(s => s.surveillantId);
    const nouveaux = surveillants
      .filter(s => !existantsIds.includes(s.id))
      .map(s => ({ examId, surveillantId: s.id }));

    if (!nouveaux.length) throw new Error("Tous les surveillants sont déjà affectés");

    const chevauchement = [];
    const results = [];

    for (const s of surveillants) {
      if (existantsIds.includes(s.id)) continue;

      const conflict = await getConflict(examId, s.id);
      if (conflict) {
        chevauchement.push({
          surveillantId: s.id,
          fullname: s.fullname,
          status: "conflit d'horaire",
        });
        continue;
      }

      results.push({ examId, surveillantId: s.id });
    }

    if (results.length > 0) {
      await Supervision.bulkCreate(results);
    }

    const conflitMessage =
      chevauchement.length > 0
        ? `${chevauchement.length} surveillant(s) non assigné(s) (déjà pris ou conflit d'horaire)`
        : "";

    return {
      message: `${results.length} surveillant(s) assigné(s) à l’examen`,
      conflitMessage,
      chevauchement,
    };
  }

  // Lire toutes les supervisions
  static async getAllSupervisions() {
    return await Supervision.findAll({
      include: [
        { model: User, as: "surveillant", attributes: ["id", "fullname"] },
        { model: Salle, as: "salle", attributes: ["label"] },
      ],
    });
  }

  // Lire les supervisions d’un examen spécifique
  static async getByExam(examId) {
    return await Supervision.findAll({
      where: { examId },
      include: [
        { model: User, as: "surveillant", attributes: ["id", "fullname", "email"] },
      ],
    });
  }

  // Lire les supervisions d’un surveillant spécifique
  static async getBySurveillant(surveillantId) {
    return await Supervision.findAll({
      where: { surveillantId },
      include: [
        { model: Exam, attributes: ["id", "date", "duree"] },
      ],
    });
  }

  // Modifier une supervision
  static async updateSupervision(id, data) {
    const supervision = await Supervision.findByPk(id);
    if (!supervision) throw new Error("Supervision introuvable");

    await supervision.update(data);
    return supervision;
  }

  // Supprimer une supervision
  static async deleteSupervision(id) {
    const supervision = await Supervision.findByPk(id);
    if (!supervision) throw new Error("Supervision introuvable");

    await supervision.destroy();
    return { message: "Supervision supprimée avec succès" };
  }
}


/*====================Verification du chevauchement des examens superviser=====================*/
const getConflict = async (examId, surveillantId) => {

  const calendrierTarget = await Calendrier.findOne({ where: { examId } });
  if (!calendrierTarget) throw new Error("Calendrier non trouvé pour cet examen");

  const { start_time, end_time } = calendrierTarget;
  const supervisions = await Supervision.findAll({ where: { surveillantId } });

  for (const s of supervisions) {
    const calendrier = await Calendrier.findOne({ where: { examId: s.examId } });
    if (!calendrier) continue;

    // Vérifier chevauchement
    if (
      start_time < calendrier.end_time &&
      end_time > calendrier.start_time
    ) {
      return true;
    }
  }

  return false;
}
