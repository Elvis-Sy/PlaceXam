import { SupervisionService } from "./supervisionService.js";
import { AffectationService } from "./affectationService.js";

/**
 * Fonctions utilitaires pour la partie "surveillant"
 */
export class SurveillantService {
  static async getMySupervisions(surveillantId) {
    if (!surveillantId) throw new Error("surveillantId requis");
    return await SupervisionService.getBySurveillant(surveillantId);
  }

  static async getMySalles(surveillantId) {
    const list = await this.getMySupervisions(surveillantId);
    const map = new Map();
    for (const s of list) {
      const salle = s.salle ?? s.Salle ?? (s.salleId ? { id: s.salleId, label: s.salleLabel, capacite: s.salleCapacite } : null);
      if (!salle || !salle.id) continue;
      map.set(String(salle.id), { id: salle.id, label: salle.label ?? salle.label ?? null, capacite: salle.capacite });
    }
    return Array.from(map.values());
  }

  static async getSalleOccupancyForSurveillant(surveillantId, salleId, date = null) {
    if (!surveillantId) throw new Error("surveillantId requis");
    if (!salleId) throw new Error("salleId requis");

    // vérifier que le surveillant est bien responsable de la salle
    const mySupervisions = await this.getMySupervisions(surveillantId);
    const supervisesSalle = mySupervisions.some((s) => {
      const sid = s.salle?.id ?? s.Salle?.id ?? s.salleId ?? null;
      return sid && String(sid) === String(salleId);
    });
    if (!supervisesSalle) {
      throw new Error("Accès refusé — vous ne supervisez pas cette salle");
    }

    // déléguer à AffectationService (réutilise la logique d'occupation)
    return await AffectationService.getOccupancyBySalle(salleId, date);
  }
}

export default SurveillantService;