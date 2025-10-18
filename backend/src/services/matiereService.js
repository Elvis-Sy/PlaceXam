import Matiere from "../models/matiereModel.js";
import { parseFile } from "../utils/importHelper.js";

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

  // Creation en masse via un fichier excel (csv, xlsx)
  static async importMatiere(filePath) {
    const data = await parseFile(filePath);
    const inserted = [];

    for (const row of data) {
      const { label, niveau } = row;
      if (!label || !niveau) continue;

      // Vérifie s'il existe déjà
      const exists = await Matiere.findOne({ where: { label, niveau } });
      if (exists) continue;

      const matiere = await Matiere.create({ label, niveau });
      inserted.push(matiere);
    }

    return inserted;
  }
}
