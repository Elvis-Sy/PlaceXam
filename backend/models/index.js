// models/index.js
import { sequelize } from "../config/db.js";
import User from "./userModel.js";
import Affectation from "./affectationModel.js";
import Calendrier from "./calendrierModel.js";
import Exam from "./examModel.js";
import Matiere from "./matiereModel.js";
import Place from "./placeModel.js";
import Salle from "./salleModel.js";
import Supervision from "./supervisionModel.js";


// ===================== Relations ===================== //

//// Étudiants <-> Affectations
User.hasMany(Affectation, { foreignKey: "etudiantId" });
Affectation.belongsTo(User, { foreignKey: "etudiantId" });

//// Exam <-> Affectations
Exam.hasMany(Affectation, { foreignKey: "examId" });
Affectation.belongsTo(Exam, { foreignKey: "examId" });

//// Salle <-> Place
Salle.hasMany(Place, { foreignKey: "salleId" });
Place.belongsTo(Salle, { foreignKey: "salleId" });

//// Place <-> Affectation
Place.hasMany(Affectation, { foreignKey: "placeId" });
Affectation.belongsTo(Place, { foreignKey: "placeId" });

//// Exam <-> Supervision
Exam.hasMany(Supervision, { foreignKey: "examId" });
Supervision.belongsTo(Exam, { foreignKey: "examId" });

//// Surveillant <-> Supervision
User.hasMany(Supervision, { foreignKey: "surveillantId" });
Supervision.belongsTo(User, { foreignKey: "surveillantId" });

//// Exam <-> Calendrier
Exam.hasMany(Calendrier, { foreignKey: "examId" });
Calendrier.belongsTo(Exam, { foreignKey: "examId" });

//// Salle <-> Calendrier
Salle.hasMany(Calendrier, { foreignKey: "salleId" });
Calendrier.belongsTo(Salle, { foreignKey: "salleId" });

//// Matiere <-> Exam : 1 matière peut avoir plusieurs sessions
Matiere.hasMany(Exam, { foreignKey: "matiereId" });
Exam.belongsTo(Matiere, { foreignKey: "matiereId" });

// ========================================== //

sequelize.sync({ alter: true })
  .then(() => console.log("✅ Synchronisation à la base MySQL réussie !"))
  .catch(err => console.error("❌ Erreur de synchronosation :", err));

export {
  User,
  Affectation,
  Calendrier,
  Exam,
  Matiere,
  Place,
  Salle,
  Supervision,
};
