import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());

export const enviarCorreoRecuperacion = async (correo, codigoOTP) => {
  // Generar identificadores únicos
  const timestamp = new Date().toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();

  const msg = {
    to: correo,
    from: {
      name: process.env.SENDGRID_FROM_NAME,
      email: process.env.SENDGRID_FROM_EMAIL,
    },
    // ✅ Asunto único con timestamp
    subject: `🔐 Recuperación de contraseña NovaGraf [${timestamp}] - ${uniqueId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔐 Recuperación de contraseña</h2>
        <p>Hemos recibido una <strong>nueva solicitud</strong> para restablecer tu contraseña.</p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">Tu código de verificación es:</p>
          <h1 style="color: #2563eb; font-size: 36px; margin: 10px 0; letter-spacing: 5px; text-align: center;">${codigoOTP}</h1>
        </div>
        <p style="color: #dc2626; font-weight: bold;">⏱️ Este código expira en 2 minutos.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Solicitud: #${uniqueId} - ${new Date().toLocaleString('es-MX')}
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">Si no solicitaste este cambio, ignora este mensaje.</p>
      </div>
    `,
    // ✅ Headers únicos para evitar agrupación
    headers: {
      'Message-ID': `<recuperacion-${Date.now()}-${uniqueId}@novagraf.com>`,
      'X-Entity-Ref-ID': `RECOVERY-${Date.now()}`,
      'X-Action-Type': 'password-recovery'
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo de RECUPERACIÓN enviado a ${correo} - ID: ${uniqueId}`);
  } catch (error) {
    console.error("Error enviando correo de recuperación:", error.response?.body || error.message);
    throw new Error("No se pudo enviar el correo de recuperación");
  }
};