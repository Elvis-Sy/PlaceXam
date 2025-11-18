import Supervision from "../models/supervisionModel.js";
import Exam from "../models/examModel.js";
import User from "../models/userModel.js";
import Salle from "../models/salleModel.js";
import Matiere from "../models/matiereModel.js";

export class SupervisionService {
  /**
   * Créer une supervision (sans vérifier le calendrier)
   */
  static async createSupervision(data) {
    const { examId, surveillantId, salleId } = data;

    // Vérifier que le surveillant existe
    if (surveillantId) {
      const surveillant = await User.findByPk(surveillantId);
      if (!surveillant || surveillant.role !== "surveillant") {
        throw new Error("Surveillant introuvable ou invalide");
      }
    }

    // Vérifier que l'examen existe (optionnel)
    if (examId) {
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        throw new Error("Examen introuvable");
      }
    }

    // Vérifier que la salle existe (optionnel)
    if (salleId) {
      const salle = await Salle.findByPk(salleId);
      if (!salle) {
        throw new Error("Salle introuvable");
      }
    }

    // Créer la supervision
    const supervision = await Supervision.create({
      examId: examId || null,
      surveillantId: surveillantId || null,
      salleId: salleId || null,
    });

    return supervision;
  }

  /**
   * Assigner plusieurs surveillants à un examen
   */
  static async assignerPlusieursSurveillants(examId, surveillantIds) {
    if (!examId) throw new Error("examId requis");
    if (!Array.isArray(surveillantIds)) throw new Error("surveillantIds doit être un tableau");

    // Vérifier que l'examen existe
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error("Examen introuvable");

    // Vérifier que tous les surveillants existent
    for (const id of surveillantIds) {
      const surveillant = await User.findByPk(id);
      if (!surveillant || surveillant.role !== "surveillant") {
        throw new Error(`Surveillant ${id} introuvable ou invalide`);
      }
    }

    // Créer les supervisions
    const supervisions = await Promise.all(
      surveillantIds.map((surveillantId) =>
        Supervision.create({
          examId,
          surveillantId,
          salleId: null,
        })
      )
    );

    return { count: supervisions.length, supervisions };
  }

  /**
   * Récupérer toutes les supervisions avec détails
   */
  static async getAllSupervisions() {
    try {
      return await Supervision.findAll({
        include: [
          {
            model: Exam,
            attributes: ["id", "date", "duree"],
            include: [{ model: Matiere, attributes: ["label", "niveau"] }],
          },
          {
            model: User,
            as: "surveillant",
            attributes: ["id", "fullname", "email"],
          },
          {
            model: Salle,
            as: "salle",
            attributes: ["id", "label", "capacite"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (err) {
      console.error("SupervisionService.getAllSupervisions error:", err);
      throw err;
    }
  }

  /**
   * Récupérer supervisions par examen
   */
  static async getByExam(examId) {
    return Supervision.findAll({
      where: { examId },
      include: [
        {
          model: User,
          as: "surveillant",
          attributes: ["id", "fullname", "email"],
        },
        {
          model: Salle,
          attributes: ["id", "label"],
        },
      ],
    });
  }

  /**
   * Récupérer supervisions par surveillant
   */
  static async getBySurveillant(surveillantId) {
    return Supervision.findAll({
      where: { surveillantId },
      include: [
        {
          model: Exam,
          attributes: ["id", "date", "duree"],
          include: [{ model: Matiere, attributes: ["label"] }],
        },
        {
          model: Salle,
          attributes: ["id", "label"],
        },
      ],
    });
  }

  /**
   * Mettre à jour une supervision
   */
  static async updateSupervision(id, data) {
    const supervision = await Supervision.findByPk(id);
    if (!supervision) throw new Error("Supervision introuvable");

    // Vérifier les mises à jour
    if (data.surveillantId) {
      const surveillant = await User.findByPk(data.surveillantId);
      if (!surveillant || surveillant.role !== "surveillant") {
        throw new Error("Surveillant invalide");
      }
    }

    if (data.examId) {
      const exam = await Exam.findByPk(data.examId);
      if (!exam) throw new Error("Examen introuvable");
    }

    if (data.salleId) {
      const salle = await Salle.findByPk(data.salleId);
      if (!salle) throw new Error("Salle introuvable");
    }

    await supervision.update(data);
    return supervision;
  }

  /**
   * Supprimer une supervision
   */
  static async deleteSupervision(id) {
    const supervision = await Supervision.findByPk(id);
    if (!supervision) throw new Error("Supervision introuvable");

    await supervision.destroy();
    return { message: "Supervision supprimée avec succès" };
  }
}
