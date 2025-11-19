import Supervision from "../models/supervisionModel.js";
import Salle from "../models/salleModel.js";
import Exam from "../models/examModel.js";
import Affectation from "../models/affectationModel.js";
import User from "../models/userModel.js";
import Place from "../models/placeModel.js";
import { Op } from "sequelize";
import Matiere from "../models/matiereModel.js";
import { sequelize } from "../../config/db.js";
import Calendrier from "../models/calendrierModel.js";

export class dashboardService {
  /**
   * Récupère les données du dashboard
   * - Compte total d'étudiants, examens, salles, surveillants
   * - Récupère les étudiants non affectés (ceux qui n'ont pas d'affectation pour un examen de leur niveau)
   * - Récupère les salles sans surveillant
   */
  static async fetchDashboardData() {
    const totalStudents = await User.count({ where: { role: "etudiant" } });
    const totalExams = await Exam.count();
    const totalRooms = await Salle.count();
    const totalSurveillants = await User.count({ where: { role: "surveillant" } });

    const upcomingExams = await Exam.findAll({
      include: [{ model: Matiere, attributes: ["label", "niveau"] }],
      where: { date: { [Op.gte]: new Date() } },
      order: [["date", "ASC"]],
    });

    const examsByNiveau = {};
    for (const ex of upcomingExams) {
      const niveau = ex.Matiere?.niveau;
      if (niveau) {
        if (!examsByNiveau[niveau]) examsByNiveau[niveau] = [];
        examsByNiveau[niveau].push(ex.id);
      }
    }

    const students = await User.findAll({
      where: { role: "etudiant" },
      include: [
        {
          model: Affectation,
          required: false,
          include: [
            {
              model: Exam,
              attributes: ["id"],
              include: [{ model: Matiere, attributes: ["id", "label", "niveau"] }],
            },
          ],
        },
      ],
    });

    const unassignedStudents = students
      .map((s) => {
        const examsForNiveau = examsByNiveau[s.niveau] || [];
        if (examsForNiveau.length === 0) {
          return null;
        }
        const assignedExamIds = Array.isArray(s.Affectations)
          ? s.Affectations.map((a) => a.examId)
          : [];

        const unassignedExamId = examsForNiveau.find((examId) => !assignedExamIds.includes(examId));

        if (unassignedExamId) {
          const exam = upcomingExams.find((e) => e.id === unassignedExamId);
          const examLabel = exam?.Matiere?.label || null;

          return {
            id: s.id,
            fullname: s.fullname,
            email: s.email,
            niveau: s.niveau,
            examLabel,
            examId: unassignedExamId,
            needsAssignment: true,
          };
        }
        return null;
      })
      .filter(Boolean);

    const salles = await Salle.findAll({
      include: [
        {
          model: Supervision,
          as: "supervisions",
          required: false,
        },
      ],
    });

    const roomsWithoutSupervisors = salles
      .filter(
        (s) =>
          !Array.isArray(s.supervisions) ||
          s.supervisions.length === 0 ||
          s.supervisions.every((sup) => !sup.surveillantId)
      )
      .map((s) => ({
        id: s.id,
        label: s.label,
        capacite: s.capacite,
      }));

    return {
      totalStudents,
      totalExams,
      totalRooms,
      totalSurveillants,
      unassignedStudents,
      roomsWithoutSupervisors,
    };
  }

  /**
   * Auto-affectation avec l'algorithme d'AffectationService
   * Répartit équitablement les étudiants du même niveau dans les salles disponibles
   * et les espace le plus possible dans les classes
   */
  static async autoAssignStudents() {
    const t = await sequelize.transaction();
    try {
      // Récup examens à venir par niveau
      const upcomingExams = await Exam.findAll({
        include: [{ model: Matiere, attributes: ["label", "niveau"] }],
        where: { date: { [Op.gte]: new Date() } },
        order: [["date", "ASC"]],
        transaction: t,
      });

      const examByNiveau = {};
      for (const ex of upcomingExams) {
        const niveau = ex.Matiere?.niveau;
        if (niveau && !examByNiveau[niveau]) examByNiveau[niveau] = ex;
      }

      let created = 0;
      const assignments = [];

      // Pour chaque exam/niveau, appliquer l'algorithme
      for (const [niveau, exam] of Object.entries(examByNiveau)) {
        // 🔸 Récupération des étudiants du niveau non affectés à cet exam
        const etudiants = await User.findAll({
          where: { role: "etudiant", niveau },
          include: [
            {
              model: Affectation,
              required: false,
              where: { examId: exam.id },
            },
          ],
          transaction: t,
        });

        const candidates = etudiants.filter((s) => !Array.isArray(s.Affectations) || s.Affectations.length === 0);
        if (candidates.length === 0) continue;

        // 🔸 Récupération des salles et places disponibles
        const salles = await Salle.findAll({
          include: [Place],
          transaction: t,
        });

        if (!salles.length) continue;

        const allPlaces = salles.flatMap(salle =>
          salle.Places.map(p => ({ ...p.get(), salleId: salle.id }))
        );

        // 🔸 Récupération des places déjà utilisées pour cet exam
        const usedPlaces = await Affectation.findAll({
          where: { examId: exam.id },
          attributes: ["placeId"],
          transaction: t,
        });
        const usedPlaceIds = usedPlaces.map(a => a.placeId);
        const freePlaces = allPlaces.filter(p => !usedPlaceIds.includes(p.id));

        if (freePlaces.length < candidates.length) continue;

        // --- ALGORITHME : Répartition équilibrée par salle ---
        // 1️⃣ Grouper étudiants par niveau (déjà fait, mais on les prépare)
        const groupes = candidates.reduce((acc, e) => {
          if (!acc[e.niveau]) acc[e.niveau] = [];
          acc[e.niveau].push(e);
          return acc;
        }, {});

        // 2️⃣ Mélanger chaque groupe pour casser les ordres fixes
        Object.values(groupes).forEach(g => g.sort(() => Math.random() - 0.5));

        // 3️⃣ Mélanger l'ordre des salles
        const shuffledSalles = [...salles].sort(() => Math.random() - 0.5);

        // 4️⃣ Répartir équitablement les étudiants de chaque niveau dans les salles
        const sallePlaces = {};
        for (const salle of shuffledSalles) {
          const places = freePlaces.filter(p => p.salleId === salle.id);
          sallePlaces[salle.id] = places.sort(() => Math.random() - 0.5);
        }

        // 5️⃣ Construire la liste finale des affectations
        const affectations = [];
        const niveaux = Object.keys(groupes);
        let indexGlobal = 0;

        while (true) {
          let added = false;

          // Parcourir chaque niveau
          for (const niv of niveaux) {
            const groupe = groupes[niv];
            if (indexGlobal < groupe.length) {
              // Trouver la salle la moins remplie pour ce niveau
              const salleChoisie = shuffledSalles.reduce((best, salle) => {
                const countNiveau = affectations.filter(
                  a =>
                    a.salleId === salle.id &&
                    candidates.find(e => e.id === a.etudiantId)?.niveau === niv
                ).length;
                return countNiveau <
                  affectations.filter(a => a.salleId === best.id).length
                  ? salle
                  : best;
              }, shuffledSalles[0]);

              const place = sallePlaces[salleChoisie.id].shift();
              if (!place) continue;

              affectations.push({
                etudiantId: groupe[indexGlobal].id,
                examId: exam.id,
                salleId: salleChoisie.id,
                placeId: place.id,
              });
              added = true;
            }
          }

          if (!added) break; // Tous placés
          indexGlobal++;
        }

        // 6️⃣ Enregistrer les affectations
        if (affectations.length > 0) {
          const createdInstances = await Affectation.bulkCreate(
            affectations.map(a => ({
              etudiantId: a.etudiantId,
              examId: a.examId,
              placeId: a.placeId,
            })),
            { transaction: t }
          );

          created += createdInstances.length;

          createdInstances.forEach((inst, idx) => {
            assignments.push({
              id: inst.id,
              etudiantId: inst.etudiantId,
              examId: inst.examId,
              placeId: inst.placeId,
              salleId: affectations[idx]?.salleId ?? null,
              createdAt: inst.createdAt,
            });
          });
        }
      }

      await t.commit();
      return {
        message: "Affectation automatique réussie",
        count: created,
        affectations: assignments,
      };
    } catch (err) {
      await t.rollback();
      console.error("Erreur autoAssignStudents:", err);
      throw err;
    }
  }

  static async autoAssignSupervisors() {
    const t = await sequelize.transaction();
    try {
      const salles = await Salle.findAll({
        include: [{ model: Supervision, as: "supervisions", required: false }],
        transaction: t,
      });

      const roomsWithoutSupervisors = salles.filter(
        (s) => !Array.isArray(s.supervisions) || s.supervisions.length === 0 || s.supervisions.every((sup) => !sup.surveillantId)
      );

      const availableSupervisors = await User.findAll({ where: { role: "surveillant" }, transaction: t });
      const assignments = [];
      let idx = 0;

      for (const room of roomsWithoutSupervisors) {
        if (idx >= availableSupervisors.length) break;
        const supervisor = availableSupervisors[idx];

        await Supervision.create(
          {
            examId: null,
            surveillantId: supervisor.id,
            salleId: room.id,
          },
          { transaction: t }
        );

        assignments.push({ salleId: room.id, surveillantId: supervisor.id });
        idx++;
      }

      await t.commit();
      return { message: "Affectation des surveillants réussie", count: assignments.length, assignments };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

export default dashboardService;

/**
 * Retourne la liste des places pour un exam avec flag occupied et info etudiant si occupée.
 */
export async function getPlacesWithOccupancy(examId) {
  const places = await Place.findAll({
    include: [
      {
        model: Affectation,
        required: false,
        where: { examId },
      },
    ],
    order: [["salleId", "ASC"], ["numero", "ASC"]],
  });

  return places.map((p) => {
    const aff = Array.isArray(p.Affectations) ? p.Affectations[0] : null;
    return {
      id: p.id,
      numero: p.numero,
      salleId: p.salleId,
      occupied: !!aff,
      etudiantId: aff ? aff.etudiantId : null,
      affectationId: aff ? aff.id : null,
    };
  });
}