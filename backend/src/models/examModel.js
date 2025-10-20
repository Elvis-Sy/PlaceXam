import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Exam = sequelize.define("Exam", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    date: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    duree: { 
        type: DataTypes.INTEGER, // en minutes
        allowNull: false 
    },
    matiereId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

export default Exam;
