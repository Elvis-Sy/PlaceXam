import Matiere from "../models/matiereModel.js";

export class MatiereService {

  // Créer une matière
  static async createMatiere(data) {
    const { label, niveau } = data;
    if (!label || !niveau) throw new Error("Le label et le niveau sont obligatoires.");

    const existing = await Matiere.findOne({ where: { label, niveau } });
    if (existing) throw new Error("Cette matière existe déjà pour ce niveau.");

    const matiere = await Matiere.create({ label, niveau });
    return matiere;
  }

  // Récupérer toutes les matières
  static async getAllMatieres() {
    return await Matiere.findAll({ order: [["label", "ASC"]] });
  }

  // Récupérer une matière par ID
  static async getMatiereById(id) {
    const matiere = await Matiere.findByPk(id);
    if (!matiere) throw new Error("Matière non trouvée");
    return matiere;
  }

  // Mettre à jour une matière
  static async updateMatiere(id, data) {
    const matiere = await Matiere.findByPk(id);
    if (!matiere) throw new Error("Matière non trouvée");

    await matiere.update(data);
    return matiere;
  }

  // Supprimer une matière
  static async deleteMatiere(id) {
    const matiere = await Matiere.findByPk(id);
    if (!matiere) throw new Error("Matière non trouvée");

    await matiere.destroy();
    return { message: "Matière supprimée avec succès" };
  }
}
