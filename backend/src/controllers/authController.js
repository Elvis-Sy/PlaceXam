import { AuthService } from "../services/authService.js";

/**
 * S'inscrire sur la plateforme
 * Appelle AuthService.signup()
 */
export const signupByEmail = async (req, res) => {
    const { fullname, email, password, role } = req.body;

    try {
        const result = await AuthService.signup(fullname, email, password, role);
        res.status(201).json({
            message: "Utilisateur créé avec succès",
            data: result,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Se connecter via email et mot de passe
 * Appelle AuthService.login()
 */
export const loginByEmail = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await AuthService.login(email, password);
        res.status(200).json({
            message: "Connexion réussie. Bienvenue !",
            data: result
        });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

/**
 * Rafraîchir le token d'accès
 * Appelle AuthService.refreshToken()
 */
export const refreshToken = async (req, res) => {
    const { token } = req.body;
    try {
        const result = await AuthService.refreshToken(token);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

/**
 * Récupérer le profil de l'utilisateur authentifié
 * Appelle AuthService.getProfil()
 */
export const getProfil = async (req, res) => {
    try {
        const result = await AuthService.getProfil(req.user.id);
        res.status(200).json({ data: result });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/**
 * Demander la réinitialisation du mot de passe
 * Envoie un email avec lien de réinitialisation
 * Appelle AuthService.forgotPassword()
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        await AuthService.forgotPassword(email);
        res.status(200).json({ 
            message: "Si un compte est associé à cet e-mail, un lien de réinitialisation y a été envoyé." 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Réinitialiser le mot de passe avec token
 * Appelle AuthService.resetPassword()
 */
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        await AuthService.resetPassword(token, newPassword);
        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * Changer le mot de passe de l'utilisateur authentifié
 * Requiert les anciens et nouveaux mots de passe
 * Appelle AuthService.changePassword()
 */
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id; // depuis authMiddleware
        const { oldPassword, newPassword } = req.body;

        // Validation basique
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Ancien et nouveau mot de passe requis" });
        }

        const result = await AuthService.changePassword(userId, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
