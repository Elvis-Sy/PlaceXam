import { UserService } from "../services/userService.js";
import { parseFile } from "../utils/importHelper.js";

export const createUser = async (req, res) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json({ 
        message: "Utilisateur créé avec succès", 
        data: result 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const adminId = req.user.id;
    const result = await UserService.getAllUsers(adminId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const result = await UserService.getUserById(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await UserService.updateUser(id, req.body);
    res.status(200).json({ 
        message: "Utilisateur mis à jour avec succès", 
        data: result 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const result = await UserService.updateProfile(id, req.body);
    res.status(200).json({ 
        message: "Profile mis à jour avec succès", 
        data: result 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const importEtudiant = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }

    // 1️⃣ Lire le contenu du fichier CSV/XLSX
    const etudiants = await parseFile(req.file.path);

    if (!etudiants || etudiants.length === 0) {
      return res.status(400).json({ message: "Fichier vide ou illisible" });
    }

    // 2️⃣ Harmoniser les clés (au cas où les colonnes aient des majuscules ou noms différents)
    const normalized = etudiants.map(e => ({
      fullname: e.fullname || e.nom || e.name || e["Fullname"] || e["Nom"] || "",
      email: e.email || e.mail || e["Email"] || e["Adresse mail"] || "",
      niveau: e.niveau || e.Niveau || e.grade || e["Classe"] || "",
    }));

    // 3️⃣ Importer via le service
    const result = await UserService.importEtudiant(normalized);

    res.status(200).json({
      message: "Étudiants importés avec succès",
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Erreur import:", err);
    res.status(500).json({ message: err.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;    
    const result = await UserService.searchUsers(query);
    res.status(200).json(result);
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const adminId = req.user.id;
    
    // Valider le rôle
    const validRoles = ["etudiant", "surveillant", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }
    
    const result = await UserService.getUsersByRole(role, adminId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
