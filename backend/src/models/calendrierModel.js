import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Calendrier = sequelize.define("Calendrier", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    start_time: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    end_time: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
    ,
    // salleId: {
    //     type: DataTypes.UUID,
    //     allowNull: false,
    // },
});


export default Calendrier;
