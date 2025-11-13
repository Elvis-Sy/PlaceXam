import nodemailer from 'nodemailer';
import 'dotenv/config'; 

const transporter = nodemailer.createTransport({
    
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com', 
    port: process.env.EMAIL_PORT ?? 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ----------------------------------------------------------------------
// 2. Fonction d'Envoi d'E-mail Réutilisable
// ----------------------------------------------------------------------

/**
 * Envoie un e-mail via le service configuré (Gmail).
 * @param {object} options
 * @param {string|string[]} options.to - Adresse(s) e-mail du destinataire.
 * @param {string} options.subject - Sujet de l'e-mail.
 * @param {string} [options.html] - Corps de l'e-mail au format HTML.
 */

const LIEN_VERS_SITE = "http://127.0.0.1:5174/auth/login";

export const sendEmailLogin = async ({ to, MOT_DE_PASSE_DEFAUT, role, text }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ AVERTISSEMENT: Configuration EMAIL incomplète. E-mail non envoyé.');
        return; 
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: `Votre compte ${role} a été créé et est prêt à être utilisé !`,
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <title>Accès à votre Compte ${role}</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                            .header { background-color: #3f51b5; color: white; padding: 10px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                            .content { padding: 20px; }
                            .credentials { background-color: #f4f4f4; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 5px solid #3f51b5; }
                            .button { display: inline-block; background-color: #4CAF50; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                            .footer { margin-top: 30px; font-size: 0.9em; color: #777; border-top: 1px solid #eee; padding-top: 10px; text-align: center; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>🎉 Bienvenue ! Votre Compte ${role} est Prêt</h2>
                            </div>
                            <div class="content">
                                
                                <p>
                                    Un administrateur vous a ajouté à notre plateforme pour la gestion des places aux examens.
                                </p>

                                <p>
                                    Vos identifiants de connexion par défaut sont les suivants. Veuillez les utiliser pour votre première connexion, puis changez votre mot de passe immédiatement.
                                </p>

                                <div class="credentials">
                                    <p><strong>E-mail / Nom d'utilisateur :</strong> Votre adresse e-mail habituelle</p>
                                    <p><strong>Mot de passe par défaut :</strong> <code>${MOT_DE_PASSE_DEFAUT}</code></p>
                                </div>

                                <p style="text-align: center; margin: 30px 0;">
                                    <a href="${LIEN_VERS_SITE}" class="button" target="_blank">Accéder à la Plateforme</a>
                                </p>

                                <p>
                                    Si vous rencontrez des problèmes, veuillez contacter l'administrateur.
                                </p>
                            </div>
                            <div class="footer">
                                <p>Ceci est un e-mail automatique. Veuillez ne pas y répondre.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `,
            text: text,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Message envoyé: ${info.messageId} | Destinataire: ${to}`);
        return info;
    } catch (error) {
        console.error('❌ ERREUR LORS DE L\'ENVOI D\'EMAIL:', error.message);
        throw new Error(`Échec de l'envoi de l'e-mail via Gmail.`);
    }
};