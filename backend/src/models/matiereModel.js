import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Matiere = sequelize.define("Matiere", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    label: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    niveau: { 
        type: DataTypes.ENUM("L1", "L2", "L3", "M1", "M2"), 
        allowNull: false 
    },
},
{
  indexes: [
    {
      unique: true,
      fields: ['label', 'niveau']
    }
  ]
}
);

export default Matiere;
