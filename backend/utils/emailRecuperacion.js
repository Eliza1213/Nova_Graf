import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

export const enviarCorreoRecuperacion = async (correo, codigoOTP) => {
  const mailOptions = {
    from: `"NovaGraf" <${process.env.EMAIL_USER}>`,
    to: correo,
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

  await transporter.sendMail(mailOptions);
};
