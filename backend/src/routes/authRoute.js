import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { 
    getProfil,
    loginByEmail,
    refreshToken,
    signupByEmail,
    forgotPassword,
    resetPassword,
    changePassword
} from "../controllers/authController.js";

const authRouter = express.Router();

// Routes publiques
authRouter.post("/signup", signupByEmail);
authRouter.post("/login", loginByEmail);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

// Routes protégées (authentifiées)
authRouter.get("/profile", authenticate, getProfil);
authRouter.post("/change-password", authenticate, changePassword);

export default authRouter;
