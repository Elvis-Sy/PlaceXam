import express from "express";
import authRouter from "./routes/authRoute.js"

const api = express.Router();

api.use("/auth", authRouter);

export default api;
