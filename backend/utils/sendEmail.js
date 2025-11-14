import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (correo, codigoOTP) => {
  // Generar identificadores únicos
  const timestamp = new Date().toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();

  try {
    const msg = {
      to: correo,
      from: {
        name: process.env.SENDGRID_FROM_NAME, 
        email: process.env.SENDGRID_FROM_EMAIL,
      }, 
      // ✅ Asunto único con timestamp
      subject: `✅ Código de activación NovaGraf [${timestamp}] - ${uniqueId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Bienvenido a NovaGraf</h2>
          <p>Gracias por registrarte. Para activar tu cuenta, usa el siguiente código:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">Tu código de verificación es:</p>
            <h1 style="color: #059669; font-size: 36px; margin: 10px 0; letter-spacing: 5px; text-align: center;">${codigoOTP}</h1>
          </div>
          <p style="color: #dc2626; font-weight: bold;">⏱️ Este código expira en 2 minutos.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            Solicitud: #${uniqueId} - ${new Date().toLocaleString('es-MX')}
          </p>
        </div>
      `,
      // ✅ Headers únicos para evitar agrupación
      headers: {
        'Message-ID': `<activacion-${Date.now()}-${uniqueId}@novagraf.com>`,
        'X-Entity-Ref-ID': `ACTIVATION-${Date.now()}`,
        'X-Action-Type': 'account-activation'
      }
    };

    await sgMail.send(msg);
    console.log(`✅ Correo de ACTIVACIÓN enviado a ${correo} - ID: ${uniqueId}`);
  } catch (err) {
    console.error("Error enviando correo de activación:", err.response?.body || err.message);
    throw new Error("No se pudo enviar el correo de activación");
  }
};