import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido_paterno: { type: String, required: true },
  apellido_materno: { type: String },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  telefono: { type: String },
  pregunta_secreta: { type: String, required: true },
  respuesta: { type: String, required: true },
  confirmado: { type: Boolean, default: false },
  codigoOTP: { type: String },       // ✅ OTP
  otpExpira: { type: Date },         // ✅ Expiración del OTP
}, { timestamps: true });

export default mongoose.model("Usuario", usuarioSchema);
