import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // ✅ ESTA LÍNEA ES OBLIGATORIA

import "../Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({correo: "",contraseña: "",});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false); // Para activación
  const [codigoOTP, setCodigoOTP] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

   // Login tradicional
  const handleLogin = async () => {
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 200) {
        setMessage("Inicio de sesión exitoso ✅");
        setShowRecoveryOption(false);
        setTimeout(() => navigate("/home"), 1000);
      } else if (res.status === 401) {
        setMessage("La contraseña es incorrecta. ¿Deseas recuperarla?");
        setShowRecoveryOption(true);
      } else if (res.status === 403) {
        // Cuenta no activada → mostrar formulario OTP
        setMessage("Tu cuenta no está activada. Ingresa el código OTP que te enviamos al correo.");
        setShowOTPForm(true);
      } else if (res.status === 404) {
        setMessage("El correo no está registrado.");
        setShowRecoveryOption(false);
      } else if (res.status === 422) {
        // Usuario registrado solo con Google
        setMessage("Esta cuenta usa Google Sign-In. Por favor inicia sesión con Google.");
        setShowRecoveryOption(false);
      } else {
        setMessage(data.message || "Error en el inicio de sesión.");
        setShowRecoveryOption(false);
      }
    } catch (err) {
      setMessage("Error en el servidor, intenta nuevamente.");
    }
  };

   // Verificar OTP
  const handleVerifyOTP = async () => {
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/verificar-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: formData.correo, codigo: codigoOTP }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.status === 200) {
        setShowOTPForm(false);
        setTimeout(() => navigate("/home"), 1000); // Redirige después de activar
      }
    } catch (err) {
      setMessage("Error al verificar el código OTP.");
    }
  };

  // Login con Google
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();

      if (res.status === 200) {
        setMessage("Inicio de sesión con Google exitoso ✅");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setMessage(data.message || "Error al iniciar sesión con Google.");
      }
    } catch (err) {
      setMessage("Error al iniciar sesión con Google.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login Nova Graf</h2>

      {!showOTPForm ? (
        <div className="form-group">
          <p className="register-link">Correo</p>
          <input
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
          />

          <div className="password-wrapper">
            <p className="register-link">Contraseña</p>
            <input
              type={showPassword ? "text" : "password"}
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button onClick={handleLogin}>Iniciar sesión</button>

          {message && <p className="message">{message}</p>}

          {showRecoveryOption && (
            <p className="recovery-link">
              <span onClick={() => navigate("/recuperar")}>Recuperar contraseña</span>
            </p>
          )}

          <p className="register-link">
            ¿No tienes cuenta? <span onClick={() => navigate("/")}>Regístrate aquí</span>
          </p>
          <div style={{ marginTop: "20px" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setMessage("Error en Google Sign-In")}
            />
          </div>
        </div>
      ) : (
        <div className="otp-container">
          <input
            placeholder="Ingresa código OTP"
            value={codigoOTP}
            onChange={(e) => setCodigoOTP(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Verificar código</button>
        </div>
      )}
    </div>
  );
};

export default Login;
