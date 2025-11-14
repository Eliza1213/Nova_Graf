import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa';
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
  const [fieldErrors, setFieldErrors] = useState({});

  // Mostrar / ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const preguntas = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿Cuál es tu ciudad natal?",
    "¿Cuál es tu comida favorita?"
  ];

  // Validaciones específicas para cada campo - ACTUALIZADAS
  const validations = {
    nombre: {
      required: true,
      pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
      message: "El nombre solo puede contener letras y espacios"
    },
    apellido_paterno: {
      required: true,
      pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
      message: "El apellido paterno solo puede contener letras y espacios"
    },
    apellido_materno: {
      required: false,
      pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/,
      message: "El apellido materno solo puede contener letras y espacios"
    },
    correo: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Por favor, introduce un correo electrónico válido"
    },
    contraseña: {
    required: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,}$/,
    message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
  },
    confirmarContraseña: {
      required: true,
      validate: (value, formData) => value === formData.contraseña,
      message: "Las contraseñas no coinciden"
    },
    telefono: {
      required: true,
      pattern: /^[0-9]{10}$/,
      message: "El teléfono debe tener 10 dígitos"
    },
    pregunta_secreta: {
      required: true,
      message: "Por favor, selecciona una pregunta secreta"
    },
    respuesta: {
      required: true,
      minLength: 2,
      message: "Por favor, proporciona una respuesta válida (mínimo 2 caracteres)"
    }
  };

  // Función de validación de campo individual
  const validateField = (name, value, formData) => {
    const validation = validations[name];
    if (!validation) return null;
    
    if (validation.required && !value.trim()) {
      return "Este campo es obligatorio";
    }
    
    if (validation.minLength && value && value.trim().length < validation.minLength) {
      return `Debe tener al menos ${validation.minLength} caracteres`;
    }
    
    if (validation.pattern && value && !validation.pattern.test(value)) {
      return validation.message;
    }
    
    if (validation.validate && !validation.validate(value, formData)) {
      return validation.message;
    }
    
    return null;
  };

  // Validación completa del formulario
  const validateForm = (formData) => {
    const errors = {};
    let isValid = true;
    
    Object.keys(validations).forEach(field => {
      const error = validateField(field, formData[field], formData);
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
    
    // Validación en tiempo real y limpiar error del campo
    if (fieldErrors[name]) {
      const error = validateField(name, value, formData);
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

  // Registro tradicional con validación
  const handleRegister = async () => {
    const { isValid, errors } = validateForm(formData);
    
    if (!isValid) {
      setFieldErrors(errors);
      // Aplicar efecto shake a todos los campos con error
      Object.keys(errors).forEach(fieldName => {
        addShakeEffect(fieldName);
      });
      setMessage("Por favor, corrige los errores en el formulario");
      return;
    }

    // Si la validación es exitosa, proceder con el registro
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setMessage(data.message);

      if (res.status === 201) {
        setCorreoParaActivar(formData.correo);
        setFieldErrors({}); // Limpiar errores al éxito
      } else {
        // Si hay error del servidor, mostrar mensaje
        setMessage(data.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setMessage("Error de conexión con el servidor");
    }
  };

  // Registro con Google
  const handleGoogleRegister = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      setMessage("No se recibió token de Google");
      return;
    }

    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/google-register", {
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
    <div className="register-container">
      {/* Encabezado con logo y botón de regreso */}
      <div className="register-header">
        <button className="back-button" onClick={() => navigate("/login")} title="Volver al Login">
          <FaArrowLeft />
        </button>
        <div className="register-logo">
          <h1>Nova Graf</h1>
          <div className="register-subtitle">
            <FaUserPlus className="subtitle-icon" />
            <span>Crear Nueva Cuenta</span>
          </div>
        </div>
      </div>

      {!correoParaActivar ? (
        <div className="form-group">
          <div className="input-group">
            <label>Nombre *</label>
            <input 
              name="nombre" 
              placeholder="Ingresa tu nombre" 
              onChange={handleChange}
              className={getFieldClassName("nombre")}
              value={formData.nombre}
            />
            {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
          </div>

          <div className="input-group">
            <label>Apellido Paterno *</label>
            <input 
              name="apellido_paterno" 
              placeholder="Ingresa tu apellido paterno" 
              onChange={handleChange}
              className={getFieldClassName("apellido_paterno")}
              value={formData.apellido_paterno}
            />
            {fieldErrors.apellido_paterno && <span className="field-error">{fieldErrors.apellido_paterno}</span>}
          </div>

          <div className="input-group">
            <label>Apellido Materno</label>
            <input 
              name="apellido_materno" 
              placeholder="Ingresa tu apellido materno (opcional)" 
              onChange={handleChange}
              className={getFieldClassName("apellido_materno")}
              value={formData.apellido_materno}
            />
            {fieldErrors.apellido_materno && <span className="field-error">{fieldErrors.apellido_materno}</span>}
          </div>

          <div className="input-group">
            <label>Correo Electrónico *</label>
            <input 
              name="correo" 
              type="email"
              placeholder="ejemplo@correo.com" 
              onChange={handleChange}
              className={getFieldClassName("correo")}
              value={formData.correo}
            />
            {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
          </div>

          <div className="input-group">
            <label>Contraseña *</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="contraseña"
                placeholder="Mínimo 8 caracteres con mayúsculas, números y símbolos"
                onChange={handleChange}
                className={getFieldClassName("contraseña")}
                value={formData.contraseña}
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {fieldErrors.contraseña && <span className="field-error">{fieldErrors.contraseña}</span>}
          </div>

          <div className="input-group">
            <label>Confirmar Contraseña *</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmarContraseña"
                placeholder="Repite tu contraseña"
                onChange={handleChange}
                className={getFieldClassName("confirmarContraseña")}
                value={formData.confirmarContraseña}
              />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {fieldErrors.confirmarContraseña && <span className="field-error">{fieldErrors.confirmarContraseña}</span>}
          </div>

          <div className="input-group">
            <label>Teléfono *</label>
            <input 
              name="telefono" 
              type="tel"
              placeholder="10 dígitos (ej: 7121234567)" 
              onChange={handleChange}
              className={getFieldClassName("telefono")}
              value={formData.telefono}
              maxLength="10"
            />
            {fieldErrors.telefono && <span className="field-error">{fieldErrors.telefono}</span>}
          </div>

          <div className="input-group">
            <label>Pregunta de Seguridad *</label>
            <select 
              name="pregunta_secreta" 
              onChange={handleChange}
              className={getFieldClassName("pregunta_secreta")}
              value={formData.pregunta_secreta}
            >
              <option value="">-- Selecciona una pregunta --</option>
              {preguntas.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
            {fieldErrors.pregunta_secreta && <span className="field-error">{fieldErrors.pregunta_secreta}</span>}
          </div>

          <div className="input-group">
            <label>Respuesta de Seguridad *</label>
            <input 
              name="respuesta" 
              placeholder="Tu respuesta a la pregunta secreta" 
              onChange={handleChange}
              className={getFieldClassName("respuesta")}
              value={formData.respuesta}
            />
            {fieldErrors.respuesta && <span className="field-error">{fieldErrors.respuesta}</span>}
          </div>

          {message && <p className={`message ${message.includes("Error") || message.includes("corrige") ? "error" : "success"}`}>{message}</p>}
          <button className="register-button" onClick={handleRegister}>
            <FaUserPlus /> Crear Cuenta
          </button>

          <p className="register-link">
            <span onClick={() => navigate("/login")}> ¿Ya tienes cuenta?....Iniciar Sesión</span>
          </p>

           <p className="register-link">
            <span onClick={() => navigate("/")}>Volver al inicio</span>
          </p>

          <div className="divider">
            <span>Registrarse con</span>
          </div>
          <div className="google-login-container">
            <GoogleLogin 
              onSuccess={handleGoogleRegister} 
              onError={() => setMessage("Error en Google Sign-In")}
              text="signup_with"
              shape="rectangular"
              size="large"
              width="100%"
            />
          </div>
        </div>
      ) : (
        <ActivarCuenta correo={correoParaActivar} />
      )}

    </div>
  );
};

export default Register;