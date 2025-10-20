import express from "express";
import authRouter from "./routes/authRoute.js"
import userRouter from "./routes/userRoute.js";
import matiereRouter from "./routes/matiereRoute.js";
// import examRouter from "./routes/examRoute.js";
import calendrierRouter from "./routes/calendrierRoute.js";

const api = express.Router();

api.use("/auth", authRouter);
api.use("/users", userRouter);
api.use("/matieres", matiereRouter);
// api.use("/exams", examRouter);
api.use("/calendriers", calendrierRouter);

export default api;
