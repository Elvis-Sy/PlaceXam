import Supervision from "../models/supervisionModel.js";
import Salle from "../models/salleModel.js";
import Exam from "../models/examModel.js";
import Affectation from "../models/affectationModel.js";
import User from "../models/userModel.js";
import Place from "../models/placeModel.js";
import { Op } from "sequelize";
import Matiere from "../models/matiereModel.js";

export class dashboardService {
  static async fetchDashboardData() {
    const totalStudents = await User.count({ where: { role: "etudiant" } });
    const totalExams = await Exam.count();
    const totalRooms = await Salle.count();

    // Upcoming exams grouped by niveau (first upcoming exam by date)
    const upcomingExams = await Exam.findAll({
      include: [{ model: Matiere, attributes: ["label", "niveau"] }],
      where: { date: { [Op.gte]: new Date() } },
      order: [["date", "ASC"]],
    });

    const examByNiveau = {};
    for (const ex of upcomingExams) {
      const niveau = ex.Matiere?.niveau;
      if (niveau && !examByNiveau[niveau]) {
        examByNiveau[niveau] = ex;
      }
    }

    // Load students with Affectations -> Exam -> Matiere
    const students = await User.findAll({
      where: { role: "etudiant" },
      include: [
        {
          model: Affectation,
          required: false,
          include: [
            {
              model: Exam,
              attributes: ["id", "date", "duree", "matiereId"],
              include: [{ model: Matiere, attributes: ["id", "label", "niveau"] }],
            },
          ],
        },
      ],
    });

    // Unassigned students = students with no affectation rows
    const unassignedStudents = students
      .filter((s) => !Array.isArray(s.Affectations) || s.Affectations.length === 0)
      .map((s) => {
        // find an upcoming exam for the student's niveau
        const exam = examByNiveau[s.niveau] || null;
        const examLabel = exam?.Matiere?.label || null;
        return {
          id: s.id,
          fullname: s.fullname,
          email: s.email,
          niveau: s.niveau,
          examLabel,
        };
      });

    // Rooms without supervisors: fetch all rooms with supervisions and filter those with no assigned surveillant.
    const salles = await Salle.findAll({
      include: [
        {
          model: Supervision,
          as: "supervisions", // alias used in associations
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
      unassignedStudents,
      roomsWithoutSupervisors,
    };
  }

  // Basic auto assign - note: this is a simplified version and will need further refining
  static async autoAssignStudents() {
    // Find all unassigned students (no Affectation rows)
    const students = await User.findAll({
      where: { role: "etudiant" },
      include: [{ model: Affectation, required: false }],
    });

    const unassigned = students.filter((s) => !Array.isArray(s.Affectations) || s.Affectations.length === 0);

    // Get upcoming exams grouped by niveau
    const upcomingExams = await Exam.findAll({
      include: [{ model: Matiere, attributes: ["label", "niveau"] }],
      where: { date: { [Op.gte]: new Date() } },
      order: [["date", "ASC"]],
    });
    const examByNiveau = {};
    for (const ex of upcomingExams) {
      const niveau = ex.Matiere?.niveau;
      if (niveau && !examByNiveau[niveau]) {
        examByNiveau[niveau] = ex;
      }
    }

    // Available rooms with capacity > 0
    const availableRooms = await Salle.findAll({ where: { capacite: { [Op.gt]: 0 } } });

    let roomIndex = 0;
    for (const student of unassigned) {
      if (roomIndex >= availableRooms.length) break;

      const exam = examByNiveau[student.niveau];
      if (!exam) continue; // no exam for this niveau to assign to

      const room = availableRooms[roomIndex];

      // Create affectation record
      await Affectation.create({
        etudiantId: student.id,
        examId: exam.id,
        placeId: room.id, // keep existing simplified assumption
      });

      // Decrement capacity on room
      room.capacite = Math.max(0, room.capacite - 1);
      await room.save();

      if (room.capacite === 0) roomIndex++;
    }

    return true;
  }

  static async autoAssignSupervisors() {
    // Rooms that have no supervisions or only supervisions with no surveillant
    const salles = await Salle.findAll({
      include: [{ model: Supervision, as: "supervisions", required: false }],
    });

    const roomsWithoutSupervisors = salles.filter(
      (s) => !Array.isArray(s.supervisions) || s.supervisions.length === 0 || s.supervisions.every((sup) => !sup.surveillantId)
    );

    const availableSupervisors = await User.findAll({ where: { role: "surveillant" } });

    let supervisorIndex = 0;
    for (const room of roomsWithoutSupervisors) {
      if (supervisorIndex >= availableSupervisors.length) break;

      const supervisor = availableSupervisors[supervisorIndex];
      // Create a supervision entry for the room
      await Supervision.create({
        examId: null, // optional: find the exam via Calendrier if needed
        surveillantId: supervisor.id,
        salleId: room.id,
      });

      supervisorIndex++;
    }

    return true;
  }
}