import Calendrier from "../models/calendrierModel.js";
import Salle from "../models/salleModel.js";
import Exam from "../models/examModel.js";
import Matiere from "../models/matiereModel.js";
import { Op } from "sequelize";

export class CalendrierService {

    // Créer un calendrier
    static async createCalendrier({ time, examId
        // , salleId
         }) {
        // const salle = await Salle.findByPk(salleId);
        // if (!salle) throw new Error("Salle introuvable");

        const exam = await Exam.findByPk(examId);
        if (!exam) throw new Error("Examen introuvable");

        // Parse time "HH:MM"
        const [hours, minutes] = time.split(":").map(Number);

        // Créer start_time avec la date de l'examen
        const start_time = new Date(exam.date);
        start_time.setHours(hours, minutes, 0, 0);

        // Calculer end_time via la durée de l'examen
        const dureeMinutes = Number(exam.duree);
        if (isNaN(dureeMinutes)) throw new Error("Durée de l'examen invalide");
        const end_time = new Date(start_time.getTime() + dureeMinutes * 60 * 1000);

        const conflit = await Calendrier.findOne({
            where: {
                // salleId,
                start_time: { [Op.lt]: end_time }, // début du nouvel examen < fin existante
                end_time: { [Op.gt]: start_time }, // fin du nouvel examen > début existant
            },
        });
        if (conflit) throw new Error("Cette salle est déjà réservée pendant ce créneau.");
        const calendrier = await Calendrier.create({
            start_time,
            end_time,
            examId,
            // salleId,
        });

        return calendrier;
    }

    // Récupérer un calendrier par ID
    static async getCalendrierById(id) {
        const calendrier = await Calendrier.findByPk(id, {
            include: [
                { model: Exam, include: [{ model: Matiere }] },
                // { model: Salle },
            ],
        });
        if (!calendrier) throw new Error("Calendrier introuvable");
        return calendrier;
    }

    // Mettre à jour un calendrier
    static async updateCalendrier(id, data) {
        const calendrier = await Calendrier.findByPk(id, { include: [{ model: Exam }] });
        if (!calendrier) throw new Error("Calendrier introuvable");

        const exam = await Exam.findByPk(calendrier.examId);
        if (!exam) throw new Error("Examen introuvable");

        let start_time = calendrier.start_time;
        let end_time = calendrier.end_time;

        if (data.time) {
            const [hours, minutes] = data.time.split(":").map(Number);
            start_time = new Date(exam.date);
            start_time.setHours(hours, minutes, 0, 0);
            end_time = new Date(start_time.getTime() + exam.duree * 60 * 1000);
        }

        // const salleIdToCheck = data.salleId || calendrier.salleId;
        const conflict = await Calendrier.findOne({
            where: {
                // salleId: salleIdToCheck,
                id: { [Op.ne]: id },
                start_time: { [Op.lt]: end_time },
                end_time: { [Op.gt]: start_time },
            },
        });

        if (conflict) {
            throw new Error("Cette salle est déjà réservée pendant ce créneau.");
        }

        // Mettre à jour le calendrier, end_time compris
        await calendrier.update({
            // salleId: salleIdToCheck,
            start_time,
            end_time,
        });

        return calendrier;
    }

    // Supprimer un calendrier
    static async deleteCalendrier(id) {
        const calendrier = await Calendrier.findByPk(id);
        if (!calendrier) throw new Error("Calendrier introuvable");

        await calendrier.destroy();
        return { message: "Calendrier supprimé avec succès" };
    }

    // Récupérer tous les calendriers (persistés + synthétisés depuis Exam quand absent)
    static async getAllCalendriers(filters = {}) {
        // 1) Persisted calendars with their exam + matiere
        const persistedInstances = await Calendrier.findAll({
            include: [{ model: Exam, include: [{ model: Matiere }] }],
            order: [["start_time", "ASC"]],
        });
        const persisted = persistedInstances.map((p) => p.toJSON());

        // 2) Fetch exams that may not have calendrier rows
        // (optionally you can limit by date range via `filters`)
        const exams = await Exam.findAll({
            include: [{ model: Matiere }],
            where: filters.where ?? {},
        });

        // 3) Build a set of examIds that already have a calendrier
        const withCal = new Set(persisted.map((c) => c.examId ?? c.Exam?.id));

        // 4) Synthesize virtual calendar entries for exams without persisted calendrier
        const virtual = exams
            .filter((ex) => !withCal.has(ex.id) && ex.date)
            .map((ex) => {
                // Combine date and optional time if you have separate time storage
                let start = new Date(ex.date);
                // If `ex.time` exists as "HH:MM", combine it
                if (ex.time && typeof ex.time === "string") {
                    const [hhRaw, mmRaw] = ex.time.split(":");
                    const hh = Number(hhRaw);
                    const mm = Number(mmRaw ?? 0);
                    if (!Number.isNaN(hh)) {
                        start.setHours(hh, Number.isNaN(mm) ? 0 : mm, 0, 0);
                    }
                }
                const dureeMs = (Number(ex.duree) || 60) * 60 * 1000;
                const end = new Date(start.getTime() + dureeMs);

                return {
                    id: `virtual-exam-${ex.id}`,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    examId: ex.id,
                    Exam: ex, // keep exam so frontend can display matiere/label
                    virtual: true,
                };
            });

        // 5) Return combined sorted array
        const combined = [...persisted, ...virtual];
        combined.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        return combined;
    }

    /**
   * Récupérer tous les calendriers filtrés par niveau (matière.niveau)
   */
  static async getCalendriersByNiveau(niveau) {
    if (!niveau) return await this.getAllCalendriers();
    // reuse the method that returns persisted + virtual entries
    const all = await this.getAllCalendriers();
    return all.filter((c) => {
      const exam = c.Exam ?? c.exam ?? null;
      const matiere = exam?.Matiere ?? exam?.matiere ?? null;
      const examNiveau = matiere?.niveau ?? null;
      return examNiveau === niveau;
    });
  }
}
