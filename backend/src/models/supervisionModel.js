import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Supervision = sequelize.define("Supervision", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    surveillantId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

export default Supervision;
