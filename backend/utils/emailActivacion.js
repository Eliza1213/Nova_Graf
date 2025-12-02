import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());

export const enviarCorreoActivacion = async (correo, codigoOTP) => {
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
    subject: `✅ Reenvío código activación NovaGraf [${timestamp}] - ${uniqueId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">✅ Código de activación reenviado</h2>
        <p>Has solicitado un <strong>nuevo código</strong> de activación para tu cuenta.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
          <p style="margin: 0; font-size: 14px; color: #065f46;">Tu código de activación es:</p>
          <h1 style="color: #059669; font-size: 36px; margin: 10px 0; letter-spacing: 5px; text-align: center;">${codigoOTP}</h1>
        </div>
        <p style="color: #dc2626; font-weight: bold;">⏱️ Este código expira en 2 minutos.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Solicitud: #${uniqueId} - ${new Date().toLocaleString('es-MX')}
        </p>
      </div>
    `,
    headers: {
      'Message-ID': `<reenvio-activacion-${Date.now()}-${uniqueId}@novagraf.com>`,
      'X-Entity-Ref-ID': `RESEND-ACTIVATION-${Date.now()}`,
      'X-Action-Type': 'resend-activation'
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo de REENVÍO ACTIVACIÓN enviado a ${correo} - ID: ${uniqueId}`);
  } catch (error) {
    console.error("Error enviando correo de activación:", error.response?.body || error.message);
    throw new Error("No se pudo enviar el correo de activación");
  }
};