import express from "express";
import { 
    loginByEmail,
    refreshToken,
    signupByEmail
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signupByEmail);
authRouter.post("/login", loginByEmail);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;
