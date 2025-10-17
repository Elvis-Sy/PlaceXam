import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define("User", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    nom: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    email: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
    },
    role: { 
      type: DataTypes.ENUM("Admin", "etudiant", "surveillant"), 
      allowNull: false 
    },
});

export default User;
