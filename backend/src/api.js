import express from "express";
import authRouter from "./routes/authRoute.js"
import userRouter from "./routes/userRoute.js";
import matiereRouter from "./routes/matiereRoute.js";
import examRouter from "./routes/examRoute.js";
import calendrierRouter from "./routes/calendrierRoute.js";
import salleRouter from "./routes/salleRoute.js";
import affectationRouter from "./routes/affectationRoute.js";
import supervisionRouter from "./routes/supervisionRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
const api = express.Router();

api.use("/auth", authRouter);
api.use("/users", userRouter);
api.use("/matieres", matiereRouter);
api.use("/exams", examRouter);
api.use("/calendriers", calendrierRouter);
api.use("/salles", salleRouter);
api.use("/affectations", affectationRouter);
api.use("/supervisions", supervisionRouter);
api.use("/dashboard", dashboardRouter);

export default api;
