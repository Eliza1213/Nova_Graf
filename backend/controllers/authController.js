import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/sendEmail.js";
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
        googleUser: true,   // Marca como usuario Google
        confirmado: true,   // Activado automáticamente
      });
      await user.save();
    }

    res.status(200).json({
      message: user ? "Usuario ya registrado con Google" : "Usuario registrado con Google",
      correo,
      nombre,
    });

  } catch (err) {
    console.error("Error Google Register:", err.message);
    res.status(400).json({ message: "Token de Google inválido" });
  }
};

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

    const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new Usuario({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      password: hashedPassword,
      telefono,
      pregunta_secreta,
      respuesta,
      codigoOTP,
      otpExpira: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
      confirmado: false, // Por defecto no confirmado
    });

    await user.save();
    console.log("Usuario registrado:", correo, "OTP:", codigoOTP);

    try {
      await sendOTPEmail(correo, codigoOTP);
      console.log("Correo de activación enviado a:", correo);
      return res.status(201).json({ message: "Ingresa el código para activar tu cuenta" });
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



// 🔹 Login
export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(404).json({ message: "El correo no está registrado" });
    if (!user.confirmado) return res.status(403).json({ message: "Tu cuenta no está activada. Revisa tu correo." });

    const passwordValida = user.googleUser
      ? true // Usuarios Google no requieren contraseña
      : await bcrypt.compare(contraseña, usuario.password);


    if (!passwordValida) return res.status(401).json({ message: "Contraseña incorrecta" });

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

// 🔹 Verificar OTP (registro o recuperación)
export const verificarOTP = async (req, res) => {
   const { correo, codigo } = req.body;
 
   try {
     const usuario = await Usuario.findOne({ correo });
     if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });
 
     if (!usuario.codigoOTP) return res.status(400).json({ message: "No hay código activo. Solicita uno nuevo." });
     if (usuario.otpExpira < new Date()) return res.status(400).json({ message: "Código expirado." });
 
     if (usuario.codigoOTP !== codigo) return res.status(400).json({ message: "Código incorrecto." });
 
     // ✅ Código correcto
     usuario.codigoOTP = undefined;
     usuario.otpExpira = undefined;
    usuario.confirmado = true; // ✅ activamos la cuenta
     await usuario.save();
 
     res.status(200).json({ message: "Código verificado correctamente." });
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: "Error al verificar el código" });
   }
 };

// 🔹 Reenviar código OTP
export const reenviarCodigo = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    // Generar nuevo código y actualizar expiración
    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoOTP = nuevoCodigo;
    usuario.otpExpira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    await usuario.save();

    await sendOTPEmail(correo, nuevoCodigo);

    res.status(200).json({ message: "✅ Nuevo código enviado al correo" });
  } catch (error) {
    console.error("Error al reenviar código:", error);
    res.status(500).json({ message: "Error al reenviar el código" });
  }
};
