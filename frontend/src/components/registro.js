import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../registro.css";
import ActivarCuenta from "./ActivarCuenta";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
    telefono: "",
    pregunta_secreta: "",
    respuesta: "",
  });

  const [codigoOTP, setCodigoOTP] = useState("");
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [message, setMessage] = useState("");
  const [correoParaActivar, setCorreoParaActivar] = useState(null);

  // Mostrar / ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const preguntas = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿Cuál es tu ciudad natal?",
    "¿Cuál es tu comida favorita?"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Registro tradicional
  const handleRegister = async () => {
    const res = await fetch("https://novagraf-production-3bea.up.railway.app/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setMessage(data.message);

    if (res.status === 201) {
      // Guardamos correo para activar la cuenta
      setCorreoParaActivar(formData.correo);
    }
  };

  // Registro con Google
  const handleGoogleRegister = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      setMessage("No se recibió token de Google");
      return;
    }

    try {
      const res = await fetch("https://novagraf-production-3bea.up.railway.app/api/auth/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.status === 200) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Error al registrar con Google:", error);
      setMessage("Error de conexión con el servidor");
    }
  };

  return (
    <div className="register-container">
      {!correoParaActivar ? (
        <div className="form-group">
          <input name="nombre" placeholder="Nombre" onChange={handleChange} />
          <input name="apellido_paterno" placeholder="Apellido Paterno" onChange={handleChange} />
          <input name="apellido_materno" placeholder="Apellido Materno" onChange={handleChange} />
          <input name="correo" placeholder="Correo" onChange={handleChange} />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="contraseña"
              placeholder="Contraseña"
              onChange={handleChange}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmarContraseña"
              placeholder="Confirmar Contraseña"
              onChange={handleChange}
            />
            <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <input name="telefono" placeholder="Teléfono" onChange={handleChange} />

          <select name="pregunta_secreta" onChange={handleChange}>
            <option value="">-- Selecciona tu pregunta secreta --</option>
            {preguntas.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>

          <input name="respuesta" placeholder="Respuesta" onChange={handleChange} />
          <button onClick={handleRegister}>Registrarse</button>

          <p className="register-link">
            ¿Ya tienes cuenta?{" "}
            <span onClick={() => navigate("/login")}>Iniciar Sesión</span>
          </p>
          <hr />
          <GoogleLogin onSuccess={handleGoogleRegister} onError={() => setMessage("Error Google Sign-In")} />
        </div>
      ) : (
        <ActivarCuenta correo={correoParaActivar} />
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;
