import express from "express";
import authRouter from "./routes/authRoute.js"
import userRouter from "./routes/userRoute.js";

const api = express.Router();

api.use("/auth", authRouter);
api.use("/users", userRouter);

export default api;
