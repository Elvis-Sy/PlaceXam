import Calendrier from "../models/calendrierModel.js";
import Salle from "../models/salleModel.js";
import Exam from "../models/examModel.js";
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

    // Récupérer tous les calendriers
    static async getAllCalendriers() {
        const calendriers = await Calendrier.findAll({
        include: [
            { model: Exam },
            // { model: Salle },
        ],
        order: [["start_time", "ASC"]],
        });
        return calendriers;
    }

    // Récupérer un calendrier par ID
    static async getCalendrierById(id) {
        const calendrier = await Calendrier.findByPk(id, {
        include: [
            { model: Exam },
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
}
