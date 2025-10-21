import { Op } from "sequelize";
import Affectation from "../models/affectationModel.js";
import User from "../models/userModel.js";
import Exam from "../models/examModel.js";
import Calendrier from "../models/calendrierModel.js";
import Salle from "../models/salleModel.js";
import Place from "../models/placeModel.js";

export class AffectationService {

  // Auto-affectation (ta version)
  static async autoAffecter(examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error("Examen introuvable");

    const matiere = await exam.getMatiere?.();
    const niveau = matiere?.niveau;
    const etudiants = await User.findAll({ where: { role: "etudiant", niveau } });
    if (!etudiants.length) throw new Error("Aucun étudiant trouvé pour ce groupe");

    const calendriers = await Calendrier.findAll({
      where: { examId },
      include: [{ model: Salle, include: [Place] }],
    });

    const salles = calendriers.map(c => c.Salle);
    if (!salles.length) throw new Error("Aucune salle associée à cet examen");

    const allPlaces = salles.flatMap(salle => salle.Places);
    const usedPlaces = await Affectation.findAll({
      where: { examId },
      attributes: ["placeId"],
    });
    const usedPlaceIds = usedPlaces.map(a => a.placeId);
    const freePlaces = allPlaces.filter(p => !usedPlaceIds.includes(p.id));

    if (freePlaces.length < etudiants.length)
      throw new Error("Pas assez de places pour tous les étudiants");

    const shuffled = etudiants.sort(() => Math.random() - 0.5);

    const affectations = shuffled.map((etu, i) => ({
      etudiantId: etu.id,
      examId,
      placeId: freePlaces[i].id,
    }));

    await Affectation.bulkCreate(affectations);
    return { count: affectations.length, affectations };
  }

  // Lire toutes les affectations (avec infos liées)
  static async getAffectations() {
    return Affectation.findAll({
      include: [
        { model: User, as: "etudiant", attributes: ["id", "fullname", "niveau"] },
        { model: Exam, attributes: ["id", "duree", "date"] },
        {
          model: Place,
          include: [{ model: Salle, attributes: ["label"] }],
        },
      ],
    });
  }

  // Affectations d’un examen
  static async getAffectationsByExam(examId) {
    return Affectation.findAll({
      where: { examId },
      include: [
        { model: User, as: "etudiant", attributes: ["id", "fullname", "niveau"] },
        { model: Place, include: [{ model: Salle, attributes: ["label"] }] },
      ],
    });
  }

  // Affectations d’un étudiant
  static async getAffectationsByEtudiant(etudiantId) {
    return Affectation.findAll({
      where: { etudiantId },
      include: [
        { model: Exam, attributes: ["id", "duree", "date"] },
        { model: Place, include: [{ model: Salle, attributes: ["label"] }] },
      ],
    });
  }

  // Vérifier si une salle est dispo sur une période donnée
  static async verifierDisponibiliteSalle(salleId, dateDebut, dateFin) {
    const conflits = await Affectation.findAll({
      include: [
        {
          model: Place,
          where: { salleId },
        },
        {
          model: Exam,
          where: {
            [Op.or]: [
              { date: { [Op.between]: [dateDebut, dateFin] } },
            ],
          },
        },
      ],
    });

    return conflits.length === 0; // true si libre
  }

  // Annuler une affectation (au lieu de supprimer)
//   static async annulerAffectation(affectationId) {
//     const affectation = await Affectation.findByPk(affectationId);
//     if (!affectation) throw new Error("Affectation introuvable");

//     affectation.annulee = true;
//     await affectation.save();

//     return { message: "Affectation annulée avec succès" };
//   }
}
