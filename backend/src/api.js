import express from "express";
import authRouter from "./routes/authRoute.js"
import userRouter from "./routes/userRoute.js";
import matiereRouter from "./routes/matiereRoute.js";
import salleRouter from "./routes/salleRoute.js";

const api = express.Router();

api.use("/auth", authRouter);
api.use("/users", userRouter);
api.use("/matieres", matiereRouter);
api.use("/salles", salleRouter);

export default api;
