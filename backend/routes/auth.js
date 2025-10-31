import express from "express";
import { registerUser, verificarOTP, login,  reenviarCodigo, googleRegister} from "../controllers/authController.js";
import {
  recuperarContraseña,
  verificarCodigo,
  actualizarContraseña,
  obtenerPreguntaSecreta,
  verificarRespuestaSecreta,
} from "../controllers/recuperarController.js";

const router = express.Router();

// Registro con OTP
router.post("/register", registerUser);

// Verificar OTP
router.post("/verificar-otp", verificarOTP);
// Login
router.post("/login", login);
// 🔹 Recuperación de contraseña (envía código OTP al correo)
router.post("/recuperar", recuperarContraseña);

// 🔹 Verificación del código OTP recibido por correo
router.post("/verificar-codigo", verificarCodigo);

// 🔹 Actualización de la contraseña después de verificar el código
router.post("/actualizar-contrasena", actualizarContraseña);

// 🔹 Rutas para recuperación por pregunta secreta
router.post("/obtener-pregunta", obtenerPreguntaSecreta);        // Devuelve la pregunta según correo
router.post("/verificar-respuesta", verificarRespuestaSecreta);  // Verifica la respuesta a la pregunta secreta

router.post("/reenviar-codigo", reenviarCodigo);
router.post("/google-register", googleRegister);
router.post("/google", googleRegister); // ✅ agregar esta ruta para el login



export default router;
