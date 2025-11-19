import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Supervision = sequelize.define(
  "Supervision",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    surveillantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    salleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }
);

export default Supervision;
