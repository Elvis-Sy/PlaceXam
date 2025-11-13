import { useParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const { token } = useParams();
  console.log("Jeton capturé :", token); 

  // ... (Logique pour le formulaire de nouveau mot de passe) ...
  return (
    <div>
      <h1>Réinitialisation du mot de passe</h1>
      {token ? <p>Jeton: {token}</p> : <p>Jeton manquant.</p>}
      
      {/* Formulaire utilisant la variable 'token' pour la soumission */}
    </div>
  );
};