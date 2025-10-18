// models/index.js
import { sequelize } from "../config/db.js";
import User from "../src/models/userModel.js";
import Affectation from "../src/models/affectationModel.js";
import Calendrier from "../src/models/calendrierModel.js";
import Exam from "../src/models/examModel.js";
import Matiere from "../src/models/matiereModel.js";
import Place from "../src/models/placeModel.js";
import Salle from "../src/models/salleModel.js";
import Supervision from "../src/models/supervisionModel.js";


// ===================== Relations ===================== //

//// Étudiants <-> Affectations
User.hasMany(Affectation, { foreignKey: "etudiantId" });
Affectation.belongsTo(User, { as: "etudiant", foreignKey: "etudiantId" });

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
Supervision.belongsTo(User, { as: "surveillant", foreignKey: "surveillantId" });

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

await sequelize.sync()
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
