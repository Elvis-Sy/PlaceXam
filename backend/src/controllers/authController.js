import { AuthService } from "../services/authService.js";

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

export const loginByEmail = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await AuthService.login(email, password);
        res.status(200).json({
            message: "Connexion réussie. Bienvenu !",
            data: result
        });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

export const refreshToken = async (req, res) => {
    const { token } = req.body;
    try {
        const result = await AuthService.refreshToken(token);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

export const getProfil = async (req, res) => {
    try {
        const result = await AuthService.getProfil(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

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

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
