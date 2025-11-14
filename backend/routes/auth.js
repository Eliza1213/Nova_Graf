import express from "express";
import {
  registerUser, 
  verificarOTP, 
  login,  
  reenviarCodigo,
  googleRegister,
  recuperarContraseña,
  verificarCodigoRecuperacion,
  actualizarContraseña,
  obtenerPreguntaSecreta,
  verificarRespuestaSecreta,
} from "../controllers/authController.js";

const router = express.Router();

// Registro con OTP
router.post("/register", registerUser);

// Verificar OTP
router.post("/verificar-otp", verificarOTP);
// Login
router.post("/login", login);
// 🔹 Recuperación de contraseña (envía código OTP al correo)
router.post("/recuperar-contraseña", recuperarContraseña);

// 🔹 Verificación del código OTP recibido por correo
router.post("/verificar-codigo-recuperacion", verificarCodigoRecuperacion);

// 🔹 Actualización de la contraseña después de verificar el código
router.post("/actualizar-contrasena", actualizarContraseña);

// 🔹 Rutas para recuperación por pregunta secreta
router.post("/obtener-pregunta-secreta", obtenerPreguntaSecreta);        // Devuelve la pregunta según correo
router.post("/verificar-respuesta", verificarRespuestaSecreta);  // Verifica la respuesta a la pregunta secreta

router.post("/reenviar-codigo-recuperacion", reenviarCodigo);
router.post("/google-register", googleRegister);



export default router;
