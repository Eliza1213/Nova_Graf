import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Configuración del correo
const transporter = nodemailer.createTransport({
  service: "gmail", // o tu proveedor de correo
  auth: {
    user: process.env.EMAIL_USER, // tu correo
    pass: process.env.EMAIL_PASS  // contraseña o App Password
  }
});

// Registro de usuario con confirmación
export const registro = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Verificar si el correo ya existe
    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ message: "Correo ya registrado" });
    }

    // Encriptar contraseña
    const hashContraseña = await bcrypt.hash(contraseña, 10);

    // Generar código de confirmación de 6 dígitos
    const codigoConfirmacion = Math.floor(100000 + Math.random() * 900000).toString();

    const nuevoUsuario = new Usuario({
      ...req.body,
      contraseña: hashContraseña,
      confirmado: false,
      codigoConfirmacion
    });

    await nuevoUsuario.save();

    // Enviar correo de confirmación
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Confirma tu correo",
      text: `Tu código de confirmación es: ${codigoConfirmacion}`
    });

    res.status(201).json({ message: "Usuario registrado. Por favor, confirma tu correo con el código enviado." });
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verificación del código
export const verificarCodigo = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    if (usuario.confirmado) return res.status(400).json({ message: "Usuario ya confirmado" });

    if (usuario.codigoConfirmacion === codigo) {
      usuario.confirmado = true;
      usuario.codigoConfirmacion = undefined; // borrar el código
      await usuario.save();
      return res.json({ message: "Correo confirmado correctamente 🎉" });
    } else {
      return res.status(400).json({ message: "Código incorrecto" });
    }
  } catch (error) {
    console.error("❌ Error en verificación:", error);
    res.status(500).json({ message: error.message });
  }
};
