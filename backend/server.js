import express from "express";
import "./models/index.js"
import { connectDB } from "./config/db.js";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOption = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour les données de formulaires
app.use(cors(corsOption));

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