import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { 
    getProfil,
    loginByEmail,
    refreshToken,
    signupByEmail
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signupByEmail);
authRouter.post("/login", loginByEmail);
authRouter.post("/refresh-token", refreshToken);

authRouter.get("/profile", authenticate, getProfil); // Necessite d'être connecté

export default authRouter;
