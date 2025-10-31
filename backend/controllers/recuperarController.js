import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import { enviarCorreoRecuperacion } from "../utils/emailRecuperacion.js";

let codigos = {};

export const recuperarContraseña = async (req, res) => {
  const { correo, opcion } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ message: "No existe un usuario con ese correo." });

    const codigoOTP = Math.floor(100000 + Math.random() * 900000);
    codigos[correo] = { codigo: codigoOTP, expira: Date.now() + 10 * 60 * 1000 };

    if (opcion === "correo") {
      await enviarCorreoRecuperacion(correo, codigoOTP);
      return res.status(200).json({ message: "Código enviado al correo." });
    }

    return res.status(400).json({ message: "Método de recuperación no disponible aún." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};
// Verificar Codigo}
export const verificarCodigo = async (req, res) => {
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
    await usuario.save();

    res.status(200).json({ message: "Código verificado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al verificar el código" });
  }
};


// Actualizar contraseña
export const actualizarContraseña = async (req, res) => {
  const { correo, nuevaContraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nuevaContraseña, salt);
    usuario.contraseña = hash;
    await usuario.save();

    delete codigos[correo];
    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la contraseña." });
  }
};

// 1. Solicitar la pregunta secreta por correo
export const obtenerPreguntaSecreta = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ message: "No existe un usuario con ese correo." });

    return res.status(200).json({
      message: "Usuario encontrado",
      pregunta: usuario.pregunta_secreta
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};

// 2. Verificar la respuesta a la pregunta secreta
export const verificarRespuestaSecreta = async (req, res) => {
  const { correo, respuesta } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    if (usuario.respuesta.toLowerCase().trim() !== respuesta.toLowerCase().trim())
      return res.status(400).json({ message: "Respuesta incorrecta." });

    return res.status(200).json({ message: "Respuesta correcta. Puedes cambiar tu contraseña." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al verificar la respuesta." });
  }
};