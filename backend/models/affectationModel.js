import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Affectation = sequelize.define("Affectation", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    etudiantId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    placeId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    }, {
        indexes: [{ unique: true, fields: ["etudiantId", "examId"] }]
    }
);


export default Affectation;
