import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXPIRATION = process.env.ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || "7d";

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
}
