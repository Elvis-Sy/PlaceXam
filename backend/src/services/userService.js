import { Op } from "sequelize";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export class UserService {

    // Créer un utilisateur (ex: par un admin)
    static async createUser({ fullname, email, password, role }) {
        const existing = await User.findOne({ where: { email } });
        if (existing) throw new Error("Cet email est déjà utilisé");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role,
        });

        return user;
    }

    // Récupérer tous les utilisateurs
    static async getAllUsers(adminId) {
        const users = await User.findAll({
            attributes: ["id", "fullname", "email", "role", "createdAt"],
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
            attributes: ["id", "fullname", "email", "role", "createdAt"],
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
}
