import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const User = sequelize.define("User", {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    fullname: { 
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
      type: DataTypes.ENUM("admin", "etudiant", "surveillant"), 
      allowNull: false 
    },
});

// Creation d'un utilisateur admin à la creation des tables
User.afterSync(async () => {
    const count = await User.count();
    if (count === 0) {
        await User.create({
            fullname: "Administrateur",
            email: "admin@example.com",
            password: "$2b$10$SoD1UD4YtvFh8ze0AlZgZe6Mzf2MCIJMnHWZnuWVv4KcAWXiMJ86G",
            role: "admin",
        });
    }
});

export default User;
