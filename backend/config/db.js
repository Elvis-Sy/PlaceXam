// config/db.js
import { Sequelize } from "sequelize";
import configFile from "./config.js"
import process from "process";

const env = process.env.NODE_ENV || "development";
const config = configFile[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: false, // désactive les logs SQL
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à la base MySQL réussie !");
  } catch (error) {
    console.error("❌ Erreur de connexion :", error);
  }
};

export { sequelize, Sequelize, connectDB };