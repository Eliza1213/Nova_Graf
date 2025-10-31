// sendemail.js (función de activación corregida)

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (correo, codigoOTP) => {
  try {
    const msg = {
      to: correo,
      from: { // 💡 CORRECCIÓN: Usar el formato de objeto
        name: process.env.SENDGRID_FROM_NAME, 
        email: process.env.SENDGRID_FROM_EMAIL,
      }, 
      subject: "Código de activación Nova Graf",
      html: `<h2>Bienvenido a NovaGraf</h2>
             <p>Tu código de verificación es:</p>
             <h3>${codigoOTP}</h3>
             <p>Expira en 10 minutos.</p>`,
    };
    await sgMail.send(msg);
    console.log("Correo de activación enviado a:", correo);
  } catch (err) {
    console.error("Error enviando correo de activación:", err.response?.body || err.message);
    throw new Error("No se pudo enviar el correo de activación");
  }
};