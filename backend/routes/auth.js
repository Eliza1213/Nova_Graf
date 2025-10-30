import express from "express";
import Usuario from "../models/Usuario.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const router = express.Router();

// 📝 Registro de usuario con confirmación de correo
router.post("/registro", async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, correo, contraseña, telefono, pregunta_secreta, respuesta } = req.body;

    // Validar que no exista un usuario con el mismo correo
    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ message: "❌ El correo ya está registrado" });
    }

    // Hashear la contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    // Generar código de confirmación
    const codigoConfirmacion = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear el usuario con confirmado=false
    const nuevoUsuario = new Usuario({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      contraseña: hash,
      telefono,
      pregunta_secreta,
      respuesta,
      confirmado: false,
      codigoConfirmacion,
    });

    await nuevoUsuario.save();

    // Enviar correo con código
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // tu correo
        pass: process.env.EMAIL_PASS, // tu password o app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Confirma tu correo",
      text: `Tu código de confirmación es: ${codigoConfirmacion}`,
    });

    res.status(201).json({ message: "Usuario registrado correctamente. Revisa tu correo para confirmar." });
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📝 Verificar código de confirmación
router.post("/verificar-codigo", async (req, res) => {
  try {
    const { correo, codigo } = req.body;
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    if (usuario.confirmado) return res.status(400).json({ message: "Usuario ya confirmado" });
    if (usuario.codigoConfirmacion !== codigo) return res.status(400).json({ message: "Código incorrecto" });

    usuario.confirmado = true;
    usuario.codigoConfirmacion = null;
    await usuario.save();

    res.json({ message: "Correo confirmado correctamente 🎉" });
  } catch (error) {
    console.error("❌ Error al verificar código:", error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
