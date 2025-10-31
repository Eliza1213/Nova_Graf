import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }, // solo desarrollo
});

export const sendOTPEmail = async (correo, codigoOTP) => {
  const mailOptions = {
    from: `"Novagraf" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: "Código OTP para activar tu cuenta",
    html: `
      <h2>Bienvenido a Novagraf</h2>
      <p>Tu código de verificación es:</p>
      <h3>${codigoOTP}</h3>
      <p>Ingresa este código en la app para activar tu cuenta. Expira en 10 minutos.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
