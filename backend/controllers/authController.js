import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { enviarCorreoRecuperacion } from "../utils/emailRecuperacion.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔹 Registro con Google
export const googleRegister = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "No se recibió token de Google" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: "Token inválido" });

    const correo = payload.email;
    const nombre = payload.name || "Usuario Google";

    let user = await Usuario.findOne({ correo });

    if (!user) {
      user = new Usuario({
        nombre,
        correo,
        googleUser: true,
        confirmado: true,
      });
      await user.save();
      
      return res.status(200).json({
        message: "Usuario registrado con Google exitosamente",
        correo,
        nombre,
        googleUser: true
      });
    }

    if (user && !user.googleUser) {
      return res.status(409).json({
        message: "Este correo ya está registrado con método tradicional. Usa tu contraseña."
      });
    }

    res.status(200).json({
      message: "Inicio de sesión con Google exitoso",
      correo,
      nombre,
      googleUser: true
    });

  } catch (err) {
    console.error("Error Google Register:", err.message);
    res.status(400).json({ message: "Token de Google inválido" });
  }
};

// 🔹 Registro tradicional
export const registerUser = async (req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    correo,
    contraseña,
    confirmarContraseña,
    telefono,
    pregunta_secreta,
    respuesta,
  } = req.body;

  if (contraseña !== confirmarContraseña) {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }

  try {
    const existingUser = await Usuario.findOne({ correo });
    if (existingUser) return res.status(400).json({ message: "Correo ya registrado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);
    
    // 🔐 ENCRIPTAR LA RESPUESTA
    const hashedRespuesta = await bcrypt.hash(respuesta.toLowerCase().trim(), salt);

    const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new Usuario({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      password: hashedPassword,
      telefono,
      pregunta_secreta,
      respuesta: hashedRespuesta,
      codigoOTP,
      otpExpira: new Date(Date.now() + 2 * 60 * 1000),
      confirmado: false,
    });

    await user.save();
    console.log("Usuario registrado:", correo, "OTP:", codigoOTP, "Expira en 2 minutos");

    try {
      await sendOTPEmail(correo, codigoOTP);
      return res.status(201).json({ 
        message: "Ingresa el código para activar tu cuenta. El código expira en 2 minutos." 
      });
    } catch (err) {
      console.error("Error al enviar correo de activación:", err);
      return res.status(500).json({
        message: "Usuario registrado, pero no se pudo enviar el correo de activación",
      });
    }
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
};

// 🔹 Login con bloqueo por intentos fallidos
export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(404).json({ message: "El correo no está registrado" });

    // ✅ PRIMERO: Verificar si es usuario de Google
    if (user.googleUser) {
      return res.status(422).json({ 
        message: "Esta cuenta fue registrada con Google. Por favor inicia sesión usando Google Sign-In." 
      });
    }

    // ✅ SEGUNDO: Verificar si la cuenta está confirmada
    if (!user.confirmado) {
      return res.status(403).json({ 
        message: "Tu cuenta no está activada. Revisa tu correo para el código de verificación." 
      });
    }

    // ✅ TERCERO: Verificar si la cuenta está bloqueada TEMPORALMENTE
    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      const tiempoRestante = Math.ceil((user.bloqueadoHasta - new Date()) / 60000); // En minutos
      return res.status(403).json({ 
        message: `Cuenta bloqueada temporalmente por intentos fallidos. Intenta nuevamente en ${tiempoRestante} minutos.` 
      });
    }

    // ✅ CUARTO: Verificar que tenga contraseña (no debería pasar si ya verificamos googleUser)
    if (!user.password) {
      return res.status(422).json({ 
        message: "Esta cuenta requiere autenticación con Google. Usa el botón de Google Sign-In." 
      });
    }

    // ✅ QUINTO: Validar la contraseña
    const passwordValida = await bcrypt.compare(contraseña, user.password);

    if (!passwordValida) {
      // Incrementar los intentos fallidos
      user.intentosFallidos = (user.intentosFallidos || 0) + 1;

      // Si ha fallado 3 veces, bloquear la cuenta por 15 minutos
      if (user.intentosFallidos >= 3) {
        user.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        await user.save();
        
        return res.status(403).json({ 
          message: "Has superado el límite de intentos. Tu cuenta ha sido bloqueada temporalmente por 15 minutos." 
        });
      }

      await user.save();

      return res.status(401).json({ 
        message: `Contraseña incorrecta. Te quedan ${3 - user.intentosFallidos} intentos.` 
      });
    }

    // ✅ Si la contraseña es correcta, resetear los intentos fallidos y desbloquear
    user.intentosFallidos = 0;
    user.bloqueadoHasta = null;
    await user.save();

    res.status(200).json({
      message: `Bienvenido ${user.nombre}!`,
      usuario: {
        id: user._id,
        correo: user.correo,
        nombre: user.nombre,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};


// 🔐 Verificar respuesta de pregunta secreta
export const verificarRespuestaSecreta = async (req, res) => {
  const { correo, respuesta } = req.body;

  try {
    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Verificar que no sea usuario Google
    if (user.googleUser) {
      return res.status(422).json({ 
        message: "Esta cuenta fue registrada con Google. Usa la opción de recuperación por correo." 
      });
    }

    // 🔐 Verificar la respuesta encriptada
    const respuestaValida = await bcrypt.compare(respuesta.toLowerCase().trim(), user.respuesta);
    
    if (!respuestaValida) {
      return res.status(401).json({ message: "Respuesta incorrecta" });
    }

    res.status(200).json({ 
      message: "Respuesta verificada correctamente",
      pregunta_secreta: user.pregunta_secreta
    });

  } catch (error) {
    console.error("Error al verificar respuesta:", error);
    res.status(500).json({ message: "Error al verificar la respuesta" });
  }
};

// 🔹 Verificar OTP (para registro)
export const verificarOTP = async (req, res) => {
   const { correo, codigo } = req.body;
 
   try {
     const usuario = await Usuario.findOne({ correo });
     if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });
 
     if (!usuario.codigoOTP) return res.status(400).json({ message: "No hay código activo. Solicita uno nuevo." });
     
     // Verificar si el código ha expirado (2 minutos)
     if (usuario.otpExpira < new Date()) {
       return res.status(400).json({ 
         message: "Código expirado. El código OTP solo es válido por 2 minutos. Solicita uno nuevo." 
       });
     }
 
     if (usuario.codigoOTP !== codigo) return res.status(400).json({ message: "Código incorrecto." });
 
     usuario.codigoOTP = undefined;
     usuario.otpExpira = undefined;
     usuario.confirmado = true;
     await usuario.save();
 
     res.status(200).json({ message: "Código verificado correctamente. Cuenta activada." });
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: "Error al verificar el código" });
   }
 };

// 🔹 Reenviar código OTP (para registro)
export const reenviarCodigo = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoOTP = nuevoCodigo;
    usuario.otpExpira = new Date(Date.now() + 2 * 60 * 1000);
    await usuario.save();

    await sendOTPEmail(correo, nuevoCodigo);

    res.status(200).json({ 
      message: "✅ Nuevo código enviado al correo. Recuerda que el código expira en 2 minutos." 
    });
  } catch (error) {
    console.error("Error al reenviar código:", error);
    res.status(500).json({ message: "Error al reenviar el código" });
  }
};

// ========== RECUPERACIÓN DE CONTRASEÑA ==========

// 🔹 Recuperar contraseña - USA BASE DE DATOS
export const recuperarContraseña = async (req, res) => {
  const { correo, opcion } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ message: "No existe un usuario con ese correo." });

    // Verificar que no sea usuario Google
    if (usuario.googleUser) {
      return res.status(422).json({ 
        message: "Esta cuenta fue registrada con Google. Usa la opción de inicio de sesión con Google." 
      });
    }

    // 🔴 CORRECCIÓN: Guardar en BASE DE DATOS, no en memoria
    const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoOTP = codigoOTP;
    usuario.otpExpira = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos
    await usuario.save();

    console.log(`📧 Código de recuperación para ${correo}: ${codigoOTP}`);

    if (opcion === "correo") {
      await enviarCorreoRecuperacion(correo, codigoOTP);
      return res.status(200).json({ 
        message: "Código enviado al correo. Expira en 2 minutos." 
      });
    }

    return res.status(400).json({ message: "Método de recuperación no disponible aún." });
  } catch (error) {
    console.error("Error en recuperarContraseña:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};

// 🔹 Verificar Código Recuperación - USA BASE DE DATOS
export const verificarCodigoRecuperacion = async (req, res) => {
  const { correo, codigo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    if (!usuario.codigoOTP) {
      return res.status(400).json({ 
        message: "No hay código activo. Solicita uno nuevo." 
      });
    }
    
    // Verificar expiración (2 minutos)
    if (usuario.otpExpira < new Date()) {
      // Limpiar código expirado
      usuario.codigoOTP = undefined;
      usuario.otpExpira = undefined;
      await usuario.save();
      
      return res.status(400).json({ 
        message: "Código expirado. El código OTP solo es válido por 2 minutos. Solicita uno nuevo." 
      });
    }

    // 🔴 COMPARAR CON EL CÓDIGO DE LA BD
    if (usuario.codigoOTP !== codigo) {
      return res.status(400).json({ 
        message: "Código incorrecto. Verifica el código e intenta nuevamente." 
      });
    }

    // ✅ Código correcto - NO limpiar aún, esperar cambio de contraseña
    res.status(200).json({ 
      message: "Código verificado correctamente. Ahora puedes cambiar tu contraseña." 
    });
  } catch (error) {
    console.error("Error en verificarCodigoRecuperacion:", error);
    res.status(500).json({ message: "Error al verificar el código" });
  }
};

// 🔹 Reenviar código Recuperación
export const reenviarCodigoRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoOTP = nuevoCodigo;
    usuario.otpExpira = new Date(Date.now() + 2 * 60 * 1000);
    await usuario.save();

    console.log(`📧 Reenvío código recuperación para ${correo}: ${nuevoCodigo}`);

    await enviarCorreoRecuperacion(correo, nuevoCodigo);

    res.status(200).json({ 
      message: "✅ Nuevo código enviado al correo. Expira en 2 minutos." 
    });
  } catch (error) {
    console.error("Error en reenviarCodigoRecuperacion:", error);
    res.status(500).json({ message: "Error al reenviar el código" });
  }
};

// 🔹 Actualizar contraseña (para recuperación)
export const actualizarContraseña = async (req, res) => {
  const { correo, nuevaContraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    // Verificar que no sea usuario Google
    if (usuario.googleUser) {
      return res.status(422).json({ 
        message: "Esta cuenta fue registrada con Google. No puedes cambiar la contraseña manualmente." 
      });
    }

    // 🔒 Verificar que la nueva contraseña no sea igual a la ACTUAL
    // (aunque el usuario no la recuerde, el sistema sí la conoce)
    const esMismaContraseña = await bcrypt.compare(nuevaContraseña, usuario.password);
    if (esMismaContraseña) {
      return res.status(400).json({ 
        message: "La nueva contraseña no puede ser igual a tu contraseña actual." 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nuevaContraseña, salt);
    usuario.password = hash;
    
    // Limpiar el código OTP después de cambiar contraseña
    usuario.codigoOTP = undefined;
    usuario.otpExpira = undefined;
    
    await usuario.save();

    console.log(`✅ Contraseña actualizada para: ${correo}`);

    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error en actualizarContraseña:", error);
    res.status(500).json({ message: "Error al actualizar la contraseña." });
  }
};

// 🔹 Obtener la pregunta secreta por correo
export const obtenerPreguntaSecreta = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ message: "No existe un usuario con ese correo." });

    // Verificar que no sea usuario Google
    if (usuario.googleUser) {
      return res.status(422).json({ 
        message: "Esta cuenta fue registrada con Google. Usa la opción de recuperación por correo." 
      });
    }

    return res.status(200).json({
      message: "Usuario encontrado",
      pregunta: usuario.pregunta_secreta
    });
  } catch (error) {
    console.error("Error en obtenerPreguntaSecreta:", error);
    return res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};