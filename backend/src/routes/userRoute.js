import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
  importEtudiant,
  searchUsers,
  getUsersByRole
} from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";
import { uploadFile } from "../middlewares/mutlerMiddleware.js";


const userRouter = express.Router();

userRouter.use(authenticate); // Il faut d'abord être connecté

// Accès admin seulement
userRouter.post("/", authorizeRoles("admin"), createUser);
userRouter.get("/", authorizeRoles("admin"), getAllUsers);
userRouter.get("/search", authorizeRoles("admin"), searchUsers);
userRouter.get("/:role", authorizeRoles("admin"), getUsersByRole); 
userRouter.get("/:id", authorizeRoles("admin"), getUserById);
userRouter.patch("/:id", authorizeRoles("admin"), updateUser);
userRouter.delete("/:id", authorizeRoles("admin"), deleteUser);
userRouter.post("/import", uploadFile, authorizeRoles("admin"), importEtudiant);


// Accès global
userRouter.patch("/profile", updateProfile);

export default userRouter;
