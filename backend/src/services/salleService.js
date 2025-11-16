import Salle from "../models/salleModel.js";
import Place from "../models/placeModel.js";
import { sequelize } from "../../config/db.js";
import { Op } from "sequelize";

export class SalleService {

  // Créer une salle + ses places
  static async createSalle({ label, capacite }) {
    return await sequelize.transaction(async (t) => {
      const salle = await Salle.create({ label, capacite }, { transaction: t });
      const places = Array.from({ length: capacite }, (_, i) => ({
        numero: i + 1,
        salleId: salle.id,
      }));

      await Place.bulkCreate(places, { transaction: t });
      return salle;
    });
  }

  // Récupérer toutes les salles (avec leurs places)
  static async getAllSalles() {
    const salles = await Salle.findAll({
      order: [["createdAt", "DESC"]],
    });
    return salles;
  }

  // Récupérer une salle par ID
  static async getSalleById(id) {
    const salle = await Salle.findByPk(id, {
      include: [{ model: Place, attributes: ["id", "numero"] }],
    });
    if (!salle) throw new Error("Salle introuvable");
    return salle;
  }

  // Mettre à jour une salle (changement du label ou de la capacité)
  static async updateSalle(id, data) {
    const salle = await Salle.findByPk(id);
    if (!salle) throw new Error("Salle introuvable");

    const currentCount = salle.capacite;
    const newCount = data.capacite ?? currentCount;

    // Ajuster les places si la capacité change
    if (newCount !== currentCount) {
      if (newCount < currentCount) {
        const diff = currentCount - newCount;
        const toDelete = Array.from({ length: diff }, (_, i) => currentCount - i);
        await Place.destroy({
          where: {
            salleId: salle.id,
            numero: { [Op.in]: toDelete },
          },
        });
      } else if (newCount > currentCount) {
        const diff = newCount - currentCount;
        const newPlaces = Array.from({ length: diff }, (_, i) => ({
          numero: currentCount + i + 1,
          salleId: salle.id,
        }));
        await Place.bulkCreate(newPlaces);
      }
    }

    const result = await salle.update(data);
    return result;
  }

  // Supprimer une salle (et ses places)
  static async deleteSalle(id) {
    const salle = await Salle.findByPk(id);
    if (!salle) throw new Error("Salle introuvable");

    await Place.destroy({ where: { salleId: id } });
    await salle.destroy();

    return { message: "Salle et ses places supprimées avec succès" };
  }

  // Supprimer une place spécifique d’une salle
  // static async deletePlace(salleId, placeId) {
  //   const salle = await Salle.findByPk(salleId);
  //   if (!salle) throw new Error("Salle introuvable");

  //   const place = await Place.findOne({ where: { id: placeId, salleId } });
  //   if (!place) throw new Error("Place introuvable");

  //   await place.destroy();

  //   // Décrémenter la capacité
  //   await salle.update({ capacite: salle.capacite - 1 });

  //   return { message: "Place supprimée avec succès" };
  // }
}
