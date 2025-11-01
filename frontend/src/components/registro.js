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
  const [fieldErrors, setFieldErrors] = useState({});

  // Mostrar / ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const preguntas = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿Cuál es tu ciudad natal?",
    "¿Cuál es tu comida favorita?"
  ];

  // Validaciones específicas para cada campo
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
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
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
      message: "Por favor, proporciona una respuesta a tu pregunta secreta"
    }
  };

  // Función de validación de campo individual
  const validateField = (name, value, formData) => {
    const validation = validations[name];
    if (!validation) return null;
    
    if (validation.required && !value.trim()) {
      return "Este campo es obligatorio";
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
      {!correoParaActivar ? (
        <div className="form-group">
          <div className="input-group">
            <input 
              name="nombre" 
              placeholder="Nombre" 
              onChange={handleChange}
              className={getFieldClassName("nombre")}
            />
            {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
          </div>

          <div className="input-group">
            <input 
              name="apellido_paterno" 
              placeholder="Apellido Paterno" 
              onChange={handleChange}
              className={getFieldClassName("apellido_paterno")}
            />
            {fieldErrors.apellido_paterno && <span className="field-error">{fieldErrors.apellido_paterno}</span>}
          </div>

          <div className="input-group">
            <input 
              name="apellido_materno" 
              placeholder="Apellido Materno" 
              onChange={handleChange}
              className={getFieldClassName("apellido_materno")}
            />
            {fieldErrors.apellido_materno && <span className="field-error">{fieldErrors.apellido_materno}</span>}
          </div>

          <div className="input-group">
            <input 
              name="correo" 
              placeholder="Correo" 
              onChange={handleChange}
              className={getFieldClassName("correo")}
            />
            {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
          </div>

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="contraseña"
                placeholder="Contraseña"
                onChange={handleChange}
                className={getFieldClassName("contraseña")}
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {fieldErrors.contraseña && <span className="field-error">{fieldErrors.contraseña}</span>}
          </div>

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmarContraseña"
                placeholder="Confirmar Contraseña"
                onChange={handleChange}
                className={getFieldClassName("confirmarContraseña")}
              />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {fieldErrors.confirmarContraseña && <span className="field-error">{fieldErrors.confirmarContraseña}</span>}
          </div>

          <div className="input-group">
            <input 
              name="telefono" 
              placeholder="Teléfono" 
              onChange={handleChange}
              className={getFieldClassName("telefono")}
            />
            {fieldErrors.telefono && <span className="field-error">{fieldErrors.telefono}</span>}
          </div>

          <div className="input-group">
            <select 
              name="pregunta_secreta" 
              onChange={handleChange}
              className={getFieldClassName("pregunta_secreta")}
            >
              <option value="">-- Selecciona tu pregunta secreta --</option>
              {preguntas.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
            {fieldErrors.pregunta_secreta && <span className="field-error">{fieldErrors.pregunta_secreta}</span>}
          </div>

          <div className="input-group">
            <input 
              name="respuesta" 
              placeholder="Respuesta" 
              onChange={handleChange}
              className={getFieldClassName("respuesta")}
            />
            {fieldErrors.respuesta && <span className="field-error">{fieldErrors.respuesta}</span>}
          </div>

          <button onClick={handleRegister}>Registrarse</button>

          <p className="register-link">
            ¿Ya tienes cuenta?{" "}
            <span onClick={() => navigate("/login")}>Iniciar Sesión</span>
          </p>
          <hr />
          <div className="google-login-container">
            <GoogleLogin onSuccess={handleGoogleRegister} onError={() => setMessage("Error Google Sign-In")} />
          </div>
        </div>
      ) : (
        <ActivarCuenta correo={correoParaActivar} />
      )}

      {message && <p className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</p>}
    </div>
  );
};

export default Register;