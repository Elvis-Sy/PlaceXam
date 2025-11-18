import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth.jsx";
import axios from "../../../api/axios.js";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Grid,
} from "@mui/material";

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password reset form state
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (passwords.oldPassword === passwords.newPassword) {
      setError("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }

    setLoading(true);
    try {
      // Appel API pour changer le mot de passe
      const res = await axios.post("/auth/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      setSuccess(res.data?.message || "Mot de passe modifié avec succès");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });

      // Optionnel: rafraîchir le profil
      await fetchProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du changement de mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography className="flex items-center" variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Mon Profil <Typography
                  variant="body1"
                  sx={{
                    border: "1px solid lightgray",
                    borderRadius: "12px",
                    px: 2,
                    ml: 2,
                    py: 0.5,
                    display: "inline-block",
                    backgroundColor: user.role === "admin" ? "#ffebee" : "#e3f2fd",
                    fontWeight: "400",
                    textTransform: "capitalize",
                    color: user.role === "admin" ? "#d32f2f" : "#1976d2",
                  }}
                >
                  {user.role === "admin" && "Administrateur"}
                  {user.role === "etudiant" && "Étudiant"}
                  {user.role === "surveillant" && "Surveillant"}
                </Typography>
      </Typography>

      <Grid container spacing={3}>
        {/* LEFT SECTION: 70% - User Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Informations Personnelles
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Full Name */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                  Nom Complet
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  {user.fullname || "Non disponible"}
                </Typography>
              </Box>

              {/* Email */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  {user.email || "Non disponible"}
                </Typography>
              </Box>

              {/* Niveau (si étudiant) */}
              {user.niveau && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                    Niveau
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "500" }}>
                    {user.niveau}
                  </Typography>
                </Box>
              )}

              {/* Created At */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 0.5 }}>
                  Compte créé le
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "Non disponible"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT SECTION: 30% - Password Reset */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
              Réinitialiser le Mot de Passe
            </Typography>
            <Typography variant="caption" sx={{ color: "#999", display: "block", mb: 2 }}>
              Mettez à jour votre mot de passe pour sécuriser votre compte
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  {success}
                </Alert>
              )}

              {/* Old Password */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: "500" }}>
                  Ancien Mot de Passe
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Entrez votre ancien mot de passe"
                  disabled={loading}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* New Password */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: "500" }}>
                  Nouveau Mot de Passe
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Entrez votre nouveau mot de passe"
                  disabled={loading}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* Confirm Password */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: "500" }}>
                  Confirmer le Mot de Passe
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmez votre nouveau mot de passe"
                  disabled={loading}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : "Mettre à Jour"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}