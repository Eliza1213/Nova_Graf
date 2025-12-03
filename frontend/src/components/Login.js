import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import "../Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false); // Controla la visibilidad del formulario OTP
  const [codigoOTP, setCodigoOTP] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Validaciones
  const validations = {
    correo: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Por favor, introduce un correo electrónico válido"
    },
    contraseña: {
      required: true,
      message: "La contraseña es obligatoria"
    }
  };

  // Función de validación
  const validateField = (name, value) => {
    const validation = validations[name];
    if (!validation) return null;
    
    if (validation.required && !value.trim()) {
      return "Este campo es obligatorio";
    }
    
    if (validation.pattern && value && !validation.pattern.test(value)) {
      return validation.message;
    }
    
    return null;
  };

  // Validación completa del formulario
  const validateForm = (formData) => {
    const errors = {};
    let isValid = true;
    
    Object.keys(validations).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validación en tiempo real
    if (fieldErrors[name]) {
      const error = validateField(name, value);
      setFieldErrors({
        ...fieldErrors,
        [name]: error
      });
    }
  };

 
  const addShakeEffect = (fieldName) => {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.add('shake');
      setTimeout(() => field.classList.remove('shake'), 500);
    }
  };

  // Login tradicional con validación
  const handleLogin = async () => {
    // Resetear estados de error antes de un nuevo intento
    setMessage("");
    setShowRecoveryOption(false);
    setShowOTPForm(false); // Aseguramos que se oculte el OTP por defecto
    
    const { isValid, errors } = validateForm(formData);
    
    if (!isValid) {
      setFieldErrors(errors);
      Object.keys(errors).forEach(fieldName => {
        addShakeEffect(fieldName);
      });
      setMessage("Por favor, corrige los errores en el formulario");
      return;
    }

    // Lógica de login
    try {
      const res = await fetch("https://nova-graf.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 200) {
        setMessage("Inicio de sesión exitoso ✅");
        setFieldErrors({});
        setTimeout(() => navigate("/home"), 1000);
      } else if (res.status === 401) {
        // Maneja Intentos Fallidos 1 y 2
        setMessage(data.message); // Muestra el mensaje dinámico del backend
        // Solo muestra la opción de recuperar si el backend lo sugiere (Intento 1 y 2)
        setShowRecoveryOption(true); 
      } else if (res.status === 403) {
        // Maneja Cuenta No Activada y Cuenta Bloqueada (Intento 3 y posteriores)
        setMessage(data.message); // Muestra el mensaje dinámico (bloqueado o no activado)
        
        // Verifica si el error es la cuenta no activada para mostrar el OTP
        if (data.message && data.message.includes("no está activada")) {
          setShowOTPForm(true);
        } else {
          // Si es un error 403 pero NO es de activación, es el bloqueo por intentos
          setShowOTPForm(false);
        }

        setShowRecoveryOption(false);
      } else if (res.status === 404) {
        setMessage(data.message || "El correo no está registrado.");
        setShowRecoveryOption(false);
      } else if (res.status === 422) {
        setMessage(data.message || "Esta cuenta usa Google Sign-In. Por favor inicia sesión con Google.");
        setShowRecoveryOption(false);
      } else {
        setMessage(data.message || "Error en el inicio de sesión.");
        setShowRecoveryOption(false);
      }
    } catch (err) {
      setMessage("Error en el servidor, intenta nuevamente.");
      setShowOTPForm(false);
      setShowRecoveryOption(false);
    }
  };

  // Verificar OTP
  const handleVerifyOTP = async () => {
    if (!codigoOTP.trim()) {
      setMessage("Por favor, ingresa el código OTP");
      return;
    }

    try {
      const res = await fetch("https://nova-graf.onrender.com/api/auth/verificar-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: formData.correo, codigo: codigoOTP }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.status === 200) {
        setShowOTPForm(false);
        setTimeout(() => navigate("/home"), 1000);
      }
    } catch (err) {
      setMessage("Error al verificar el código OTP.");
    }
  };

  // Login con Google
  const handleGoogleLogin = async (credentialResponse) => {
    // ... (Lógica de Google Login sin cambios)
    try {
      const res = await fetch("https://nova-graf.onrender.com/api/auth/google-register", {
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

  // Función para obtener clase CSS según validación
  const getFieldClassName = (fieldName) => {
    if (fieldErrors[fieldName]) {
      return "error";
    }
    if (formData[fieldName] && !fieldErrors[fieldName]) {
      return "valid";
    }
    return "";
  };

  return (
    <div className="login-container">
      <h2>Login Nova Graf</h2>

      {!showOTPForm ? (
        <div className="form-group">
          <div className="input-group">
            <p className="register-link">Correo</p>
            <input
              name="correo"
              placeholder="Correo"
              value={formData.correo}
              onChange={handleChange}
              className={getFieldClassName("correo")}
            />
            {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
          </div>

          <div className="input-group">
            <p className="register-link">Contraseña</p>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="contraseña"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className={getFieldClassName("contraseña")}
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {fieldErrors.contraseña && <span className="field-error">{fieldErrors.contraseña}</span>}
          </div>

          <button onClick={handleLogin}>Iniciar sesión</button>

          {message && <p className={`message ${message.includes("Error") || message.includes("incorrecta") || message.includes("registrado") || message.includes("bloqueada") ? "error" : "success"}`}>{message}</p>}

          <p className="register-link">
          <span onClick={() => navigate("/recuperar")}>  ¿Olvidaste tu contraseña?...Recuperar</span>
          </p>
       
          <p className="register-link">
           <span onClick={() => navigate("/register")}> ¿No tienes cuenta? ...Regístrate aquí</span>
          </p>

          <p className="register-link">
           
            <span onClick={() => navigate("/")}>Volver al inicio</span>
          </p>
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setMessage("Error en Google Sign-In")}
            />
          </div>
        </div>
      ) : (
        // Formulario OTP (Solo se muestra si la cuenta NO está activada)
        <div className="otp-container">
          <h2>Ingresa código OTP</h2>
          <input
            placeholder="Ingresa código OTP"
            value={codigoOTP}
            onChange={(e) => setCodigoOTP(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Verificar código</button>
          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default Login;