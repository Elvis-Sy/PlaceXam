import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
} from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.use(authenticate); // Il faut d'abord être connecté

// Accès admin seulement
userRouter.post("/", authorizeRoles("admin"), createUser);
userRouter.get("/", authorizeRoles("admin"), getAllUsers);
userRouter.get("/:id", authorizeRoles("admin"), getUserById);
userRouter.patch("/:id", authorizeRoles("admin"), updateUser);
userRouter.delete("/:id", authorizeRoles("admin"), deleteUser);

// Accès global
userRouter.patch("/profile", updateProfile);

export default userRouter;
