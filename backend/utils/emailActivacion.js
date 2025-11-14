// utils/emailActivacion.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const enviarCorreoActivacion = async (correo, codigoOTP) => {
  const msg = {
    to: correo,
    from: {
      name: "NovaGraf",
      email: process.env.SENDGRID_FROM_EMAIL,
    },
    subject: "Activa tu cuenta - NovaGraf",
    html: `
      <h2>Bienvenido a NovaGraf</h2>
      <p>Tu código de activación es:</p>
      <h3>${codigoOTP}</h3>
      <p>Ingresa este código en la app para activar tu cuenta. Expira en 2 minutos.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Correo de activación enviado a", correo);
  } catch (error) {
    console.error("Error enviando correo de activación:", error.response?.body || error.message);
    throw new Error("No se pudo enviar el correo de activación");
  }
};
