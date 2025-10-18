import jwt from "jsonwebtoken";

const secret = "MON_SECRET_DE_TEST";
const payload = { id: "123", role: "Admin" };

// Générer un token pour tester
const token = jwt.sign(payload, secret, { expiresIn: "1h" });
console.log("Token généré :", token);

// Vérifier le token
try {
  const decoded = jwt.verify(token, secret);
  console.log("Payload décodé :", decoded);
} catch (err) {
  console.error("Erreur jwt.verify :", err.message);
}
