import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Place = sequelize.define("Place", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    numero: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    salleId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
  }, {
    indexes: [{ unique: true, fields: ["salleId", "numero"] }]
  }
);

export default Place;
