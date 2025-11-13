import { Op } from "sequelize";
import Affectation from "../models/affectationModel.js";
import User from "../models/userModel.js";
import Exam from "../models/examModel.js";
import Calendrier from "../models/calendrierModel.js";
import Salle from "../models/salleModel.js";
import Place from "../models/placeModel.js";
import Matiere from "../models/matiereModel.js";

export class AffectationService {

  // // Auto-affectation (ta version)
  // static async autoAffecter(examId) {
  //   const exam = await Exam.findByPk(examId);
  //   if (!exam) throw new Error("Examen introuvable");

  //   const matiere = await exam.getMatiere?.();
  //   const niveau = matiere?.niveau;
  //   const etudiants = await User.findAll({ where: { role: "etudiant", niveau } });
  //   if (!etudiants.length) throw new Error("Aucun étudiant trouvé pour ce groupe");

  //   const calendriers = await Calendrier.findAll({
  //     where: { examId },
  //     include: [{ model: Salle, include: [Place] }],
  //   });

  //   const salles = calendriers.map(c => c.Salle);
  //   if (!salles.length) throw new Error("Aucune salle associée à cet examen");

  //   const allPlaces = salles.flatMap(salle => salle.Places);
  //   const usedPlaces = await Affectation.findAll({
  //     where: { examId },
  //     attributes: ["placeId"],
  //   });
  //   const usedPlaceIds = usedPlaces.map(a => a.placeId);
  //   const freePlaces = allPlaces.filter(p => !usedPlaceIds.includes(p.id));

  //   if (freePlaces.length < etudiants.length)
  //     throw new Error("Pas assez de places pour tous les étudiants");

  //   const shuffled = etudiants.sort(() => Math.random() - 0.5);

  //   const affectations = shuffled.map((etu, i) => ({
  //     etudiantId: etu.id,
  //     examId,
  //     placeId: freePlaces[i].id,
  //   }));

  //   await Affectation.bulkCreate(affectations);
  //   return { count: affectations.length, affectations };
  // }

  //   // Auto-affectation améliorée : éloigner les étudiants du même niveau
  // static async autoAffecter(examId) {
  //   const exam = await Exam.findByPk(examId);
  //   if (!exam) throw new Error("Examen introuvable");

  //   const matiere = await exam.getMatiere?.();
  //   const niveau = matiere?.niveau;

  //   // Récupérer tous les étudiants concernés
  //   const etudiants = await User.findAll({
  //     where: { role: "etudiant", niveau },
  //   });
  //   if (!etudiants.length) throw new Error("Aucun étudiant trouvé pour ce groupe");

  //   // Récupérer les salles et places disponibles
  //   const calendriers = await Calendrier.findAll({
  //     where: { examId },
  //     include: [{ model: Salle, include: [Place] }],
  //   });

  //   const salles = calendriers.map(c => c.Salle);
  //   if (!salles.length) throw new Error("Aucune salle associée à cet examen");

  //   const allPlaces = salles.flatMap(salle => salle.Places);
  //   const usedPlaces = await Affectation.findAll({
  //     where: { examId },
  //     attributes: ["placeId"],
  //   });
  //   const usedPlaceIds = usedPlaces.map(a => a.placeId);
  //   const freePlaces = allPlaces.filter(p => !usedPlaceIds.includes(p.id));

  //   if (freePlaces.length < etudiants.length)
  //     throw new Error("Pas assez de places pour tous les étudiants");

  //   // --- Nouvelle logique : espacer les étudiants du même niveau ---
  //   // 1. Grouper les étudiants par niveau
  //   const groupes = etudiants.reduce((acc, etu) => {
  //     if (!acc[etu.niveau]) acc[etu.niveau] = [];
  //     acc[etu.niveau].push(etu);
  //     return acc;
  //   }, {});

  //   // 2. Trier les groupes par taille décroissante
  //   const groupesTries = Object.values(groupes).sort((a, b) => b.length - a.length);

  //   // 3. Mélanger chaque groupe individuellement
  //   groupesTries.forEach(groupe => groupe.sort(() => Math.random() - 0.5));

  //   // 4. Distribuer les étudiants en alternance
  //   const distributed = [];
  //   let index = 0;
  //   let stillStudents = true;
  //   while (stillStudents) {
  //     stillStudents = false;
  //     for (const groupe of groupesTries) {
  //       if (groupe[index]) {
  //         distributed.push(groupe[index]);
  //         stillStudents = true;
  //       }
  //     }
  //     index++;
  //   }

  //   // 5. Associer les places selon cet ordre mélangé
  //   const affectations = distributed.map((etu, i) => ({
  //     etudiantId: etu.id,
  //     examId,
  //     placeId: freePlaces[i].id,
  //   }));

  //   await Affectation.bulkCreate(affectations);
  //   return { count: affectations.length, affectations };
  // }

    // Auto-affectation avancée : répartition équilibrée par salle et éloignement par niveau
  static async autoAffecter(examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error("Examen introuvable");

    const matiere = await exam.getMatiere?.();
    const niveau = matiere?.niveau;

    // 🔸 Récupération des étudiants concernés
    const etudiants = await User.findAll({
      where: { role: "etudiant", niveau },
    });
    if (!etudiants.length) throw new Error("Aucun étudiant trouvé pour ce groupe");

    // 🔸 Récupération des salles et places disponibles
    const calendriers = await Calendrier.findAll({
      where: { examId }
    });

    console.log("Calendriers trouvés :", calendriers);

    // 🔸 Récupération des salles + places
    const salles = await Salle.findAll({
      include: [Place],
    });

    if (!salles.length) throw new Error("Aucune salle disponible");

    const allPlaces = salles.flatMap(salle =>
      salle.Places.map(p => ({ ...p.get(), salleId: salle.id }))
    );

    // 🔸 Récupération des places déjà utilisées
    const usedPlaces = await Affectation.findAll({
      where: { examId },
      attributes: ["placeId"],
    });
    const usedPlaceIds = usedPlaces.map(a => a.placeId);
    const freePlaces = allPlaces.filter(p => !usedPlaceIds.includes(p.id));

    if (freePlaces.length < etudiants.length)
      throw new Error("Pas assez de places pour tous les étudiants");

    // --- Nouvelle logique de répartition ---
    // 1️⃣ Grouper étudiants par niveau
    const groupes = etudiants.reduce((acc, e) => {
      if (!acc[e.niveau]) acc[e.niveau] = [];
      acc[e.niveau].push(e);
      return acc;
    }, {});

    // 2️⃣ Mélanger chaque groupe pour casser les ordres fixes
    Object.values(groupes).forEach(g => g.sort(() => Math.random() - 0.5));

    // 3️⃣ Mélanger l’ordre des salles
    const shuffledSalles = salles.sort(() => Math.random() - 0.5);

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
                etudiants.find(e => e.id === a.etudiantId)?.niveau === niv
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
            examId,
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
    await Affectation.bulkCreate(
      affectations.map(a => ({
        etudiantId: a.etudiantId,
        examId,
        placeId: a.placeId,
      }))
    );

    return { count: affectations.length, affectations };
  }


  // Lire toutes les affectations (avec infos liées)
  static async getAffectations() {
    return Affectation.findAll({
      include: [
        { model: User, as: "etudiant", attributes: ["id", "fullname", "niveau"] },
        {
          model: Exam,
          attributes: ["id", "duree", "date"],
          include: [
            { model: Matiere, as: "Matiere", attributes: ["id", "label", "niveau"] }
          ]
        },
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

  // Nouvelle méthode : occupation par salle
  static async getOccupancyBySalle(salleId, date) {
    // date expected 'YYYY-MM-DD' or ISO string (we consider whole day)
    if (!salleId) throw new Error("salleId requis");

    // construire intervalle début/fin de journée
    const day = date ? new Date(date) : new Date();
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    // récupérer toutes les places de la salle
    const places = await Place.findAll({
      where: { salleId },
      order: [["numero", "ASC"]],
      attributes: ["id", "numero"],
    });

    // récupérer toutes les affectations pour cette salle et cette journée
    const affectations = await Affectation.findAll({
      include: [
        {
          model: Place,
          where: { salleId },
          attributes: ["id", "numero"],
        },
        {
          model: Exam,
          where: { date: { [Op.between]: [start, end] } },
          attributes: ["id", "date", "duree"],
        },
        {
          model: User,
          as: "etudiant",
          attributes: ["id", "fullname", "email", "niveau"],
        }
      ],
    });

    // build map placeId -> affectation (if multiple exams same day, pick one or return array)
    const map = {}; // placeId -> { affectation info }
    for (const a of affectations) {
      const p = a.Place;
      if (!p) continue;
      map[p.id] = {
        etudiant: a.etudiant ? a.etudiant.get?.() ?? a.etudiant : a.etudiant,
        exam: a.Exam ? a.Exam.get?.() ?? a.Exam : a.Exam,
        affectationId: a.id,
      };
    }

    // return places with status
    const result = places.map((p) => ({
      id: p.id,
      numero: p.numero,
      occupied: Boolean(map[p.id]),
      occupant: map[p.id]?.etudiant ?? null,
      exam: map[p.id]?.exam ?? null,
      affectationId: map[p.id]?.affectationId ?? null,
    }));

    return { salleId, date: start.toISOString(), places: result };
  }
}
