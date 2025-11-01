import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido_paterno: { type: String, required: function() { return !this.googleUser; } },
  apellido_materno: { type: String },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return !this.googleUser; } },
  telefono: { type: String },
  pregunta_secreta: { type: String, required: function() { return !this.googleUser; } },
  respuesta: { type: String, required: function() { return !this.googleUser; } },
  confirmado: { type: Boolean, default: false },
  codigoOTP: { type: String },
  otpExpira: { type: Date },
  googleUser: { type: Boolean, default: false }, // Indica usuario Google
}, { timestamps: true });

export default mongoose.model("Usuario", usuarioSchema);
