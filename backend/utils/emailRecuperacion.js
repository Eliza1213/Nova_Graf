import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const enviarCorreoRecuperacion = async (correo, codigoOTP) => {
  const msg = {
    to: correo,
    from: {
      name: process.env.SENDGRID_FROM_NAME,
      email: process.env.SENDGRID_FROM_EMAIL,
    },
    subject: "Recuperación de contraseña - NovaGraf",
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Tu código de verificación es:</p>
      <h3>${codigoOTP}</h3>
      <p>Este código expira en 10 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Correo de recuperación enviado a", correo);
  } catch (error) {
    console.error("Error enviando correo:", error.response?.body || error.message);
    throw new Error("No se pudo enviar el correo de recuperación");
  }
};
