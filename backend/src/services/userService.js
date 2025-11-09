import { Op } from "sequelize";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export class UserService {

    // Créer un utilisateur (ex: par un admin)
    static async createUser({ fullname, email, password, role, niveau }) {
        const existing = await User.findOne({ where: { email } });
        if (existing) throw new Error("Cet email est déjà utilisé");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            niveau,
            role,
        });
        return user;
    }

    // Récupérer tous les utilisateurs
    static async getAllUsers(adminId) {
        const users = await User.findAll({
            attributes: ["id", "fullname", "email", "role", "niveau", "createdAt"],
            where: {
                id: { [Op.ne]: adminId } // exclut l'admin grace a son ID
            },
            order: [["createdAt", "DESC"]],
        });
        return users;
    }

    // Récupérer un utilisateur par ID
    static async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: ["id", "fullname", "email", "role", "niveau", "createdAt"],
        });
        if (!user) throw new Error("Utilisateur introuvable");
        return user;
    }

    // Mettre à jour un utilisateur
    static async updateUser(id, data) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Utilisateur introuvable");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await user.update(data);
        return user;
    }

    // Supprimer un utilisateur
    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Utilisateur introuvable");

        await user.destroy();
        return { message: "Utilisateur supprimé avec succès" };
    }

    // Mettre à son propre profile
    static async updateProfile(id, data) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Utilisateur introuvable");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await user.update(data);
        return user;
    }

        static async importEtudiant(etudiants) {
    const createdUsers = [];

    for (const etudiant of etudiants) {
        const { fullname, email, niveau } = etudiant;

        // 1️⃣ Vérification des champs essentiels
        if (!fullname || !email || !niveau) {
        console.warn(`Donnée incomplète ignorée :`, etudiant);
        continue;
        }

        // 2️⃣ Vérifier si déjà existant
        const existing = await User.findOne({ where: { email } });
        if (existing) continue;

        // 3️⃣ Générer un mot de passe aléatoire
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4️⃣ Créer l'utilisateur
        const newUser = await User.create({
        fullname,
        email,
        password: hashedPassword,
        role: "etudiant",
        niveau,
        });

        createdUsers.push({ ...newUser.get(), plainPassword: password });
    }

    return createdUsers;
    }

    static async searchUsers(query) {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { fullname: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { niveau: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: ["id", "fullname", "email", "role", "niveau", "createdAt"],
    });

    console.log("Recherche pour :", query);
    console.log("Résultats trouvés :", users.length);

    if (users.length === 0) {
      throw new Error("Utilisateur introuvable");
    }

    return users;
  }
}
