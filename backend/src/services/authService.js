import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/userModel.js";
import { Op } from "sequelize";
import { sendEmailResetPassword } from "../utils/emailUtils.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXPIRATION = process.env.ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || "7d";

const TOKEN_EXPIRATION_DURATION = 3600000; // 1 heure en millisecondes

export class AuthService {

  // S'inscrire sur la plateforme en tant qu'étudiant
  static async signup(fullname, email, password, role = "etudiant") {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error("Cet email est déjà utilisé");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      role,
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRATION }
    );

    return { user, accessToken, refreshToken };
  }

  // Se connecter via email et mot de passe
  static async login(email, password) {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("Utilisateur non trouvé");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Mot de passe incorrect");

      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRATION }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRATION }
      );

      return { accessToken, refreshToken, user };
  }

  // Vérifier le refresh token et générer un nouvel access token
  static async refreshToken(token) {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET);
      const user = await User.findByPk(payload.id);
      if (!user) throw new Error("Utilisateur non trouvé");

      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRATION }
      );

      return { accessToken };
    } catch (err) {
      throw new Error("Refresh token invalide");
    }
  }

  // Récupérer un utilisateur par ID
  static async getProfil(id) {
    const user = await User.findByPk(id, {
      attributes: ["id", "fullname", "email", "role", "createdAt"],
    });
    if (!user) throw new Error("Utilisateur introuvable");
    return user;
  }

  static async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Utilisateur introuvable avec cet e-mail.");
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const expirationDate = new Date(Date.now() + TOKEN_EXPIRATION_DURATION);
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = expirationDate;
        await user.save();
        
        // Assurez-vous que votre route frontend gère le jeton (ex: /reset-password/TOKEN_ICI)
        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

        try {
            await sendEmailResetPassword({
                to: user.email,
                resetLink: resetLink,
            });
            
            return { success: true, message: "E-mail de réinitialisation envoyé avec succès." };
        } catch (error) {
            // En cas d'échec d'envoi d'e-mail, vous pouvez choisir d'annuler le jeton en DB
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            console.error("Échec de l'envoi de l'e-mail de réinitialisation:", error);
            throw new Error("Erreur serveur lors de l'envoi de l'e-mail de réinitialisation.");
        }
    }

    static async resetPassword(token, newPassword) {
        const user = await User.findOne({ 
            where: { 
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() } // Vérifie que le token n'a pas expiré
            } 
        });

        if (!user) {
            throw new Error("Token invalide ou expiré.");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return { success: true, message: "Mot de passe réinitialisé avec succès." };
    }

    /**
   * Changer le mot de passe d'un utilisateur authentifié
   * @param {string} userId - ID de l'utilisateur
   * @param {string} oldPassword - Ancien mot de passe
   * @param {string} newPassword - Nouveau mot de passe
   * @throws Erreur si ancien mot de passe invalide ou autre erreur
   */
  static async changePassword(userId, oldPassword, newPassword) {
    // Récupérer l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'ancien mot de passe est correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Ancien mot de passe incorrect");
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new Error("Le nouveau mot de passe doit être différent de l'ancien");
    }

    // Hasher le nouveau mot de passe et mettre à jour
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return { message: "Mot de passe modifié avec succès" };
  }
}
