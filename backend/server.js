import express from "express";
import api from "./src/api.js";
import "./models/index.js"
import { connectDB } from "./config/db.js";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOption = {
    origin: process.env.FRONTEND_URL || "http://127.0.0.1:5174",
    credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour les données de formulaires
app.use(cors(corsOption));

app.use("/api", api); // Pour les differents routes

app.get('/', (req, res) => {
    const env = process.env.NODE_ENV || 'development';
    res.status(200).json({ 
        message: 'API is working.',
        environment: env,
        port: PORT
    });
});

connectDB(); // Initialisation DB
app.listen(PORT, () => {
    console.log(`🌍 Listening on Port: ${PORT}`);
});