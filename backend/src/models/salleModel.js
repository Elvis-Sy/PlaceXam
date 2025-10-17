import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Salle = sequelize.define("Salle", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    label: { 
        type: DataTypes.STRING, 
        allowNull: false },
    capacite: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
});

export default Salle;
