import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { 
    getProfil,
    loginByEmail,
    refreshToken,
    signupByEmail,
    forgotPassword,
    resetPassword
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signupByEmail);
authRouter.post("/login", loginByEmail);
authRouter.post("/refresh-token", refreshToken);
authRouter.get("/profile", authenticate, getProfil);

// Accès public - mot de passe oublié et réinitialisation
authRouter.post("/forgot-password", forgotPassword); 
authRouter.post("/reset-password", resetPassword);

export default authRouter;
