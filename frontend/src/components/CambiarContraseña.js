import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "../cambiarContraseña.css";

const CambiarContraseña = () => {
  const navigate = useNavigate();
  const correo = localStorage.getItem("correoRecuperacion");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validaciones de contraseña
  const validarContraseña = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Mínimo 8 caracteres");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Una letra minúscula");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Una letra mayúscula");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Un número");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("Un carácter especial (@$!%*?&)");
    }
    
    return errors;
  };
  

  // Calcular fortaleza de contraseña
  const calcularFortaleza = (password) => {
    const errors = validarContraseña(password);
    const totalRequisitos = 5;
    const requisitosCumplidos = totalRequisitos - errors.length;
    
    if (password.length === 0) return { nivel: "", porcentaje: 0 };
    if (requisitosCumplidos <= 2) return { nivel: "weak", porcentaje: 33 };
    if (requisitosCumplidos <= 4) return { nivel: "medium", porcentaje: 66 };
    return { nivel: "strong", porcentaje: 100 };
  };

  const fortaleza = calcularFortaleza(nuevaContraseña);
  const requisitos = validarContraseña(nuevaContraseña);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validaciones
    const nuevosErrores = {};
    
    if (nuevaContraseña.length === 0) {
      nuevosErrores.nuevaContraseña = "La nueva contraseña es obligatoria";
    } else if (requisitos.length > 0) {
      nuevosErrores.nuevaContraseña = "La contraseña no cumple con los requisitos";
    }
    
    if (confirmar.length === 0) {
      nuevosErrores.confirmar = "Confirma tu contraseña";
    } else if (nuevaContraseña !== confirmar) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      
      // Efecto  campos con error
      Object.keys(nuevosErrores).forEach(field => {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
          input.classList.add('shake');
          setTimeout(() => input.classList.remove('shake'), 500);
        }
      });
      
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/actualizar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nuevaContraseña }),
      });

      const data = await res.json();
      
      if (res.status === 200) {
        setMensaje("✅ Contraseña actualizada correctamente. Redirigiendo...");
        localStorage.removeItem("correoRecuperacion");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMensaje(data.message || "Error al actualizar la contraseña");
      }
    } catch (err) {
      setMensaje("❌ Error de conexión al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'nuevaContraseña') {
      setNuevaContraseña(value);
    } else {
      setConfirmar(value);
    }
    
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
    
    
    if (mensaje) {
      setMensaje("");
    }
  };

  // Función para obtener clase CSS del input
  const getInputClassName = (field) => {
    if (errors[field]) return "error";
    if (field === 'nuevaContraseña' && nuevaContraseña && requisitos.length === 0) return "valid";
    if (field === 'confirmar' && confirmar && nuevaContraseña === confirmar) return "valid";
    return "";
  };

  return (
    <div className="cambiar-container">
      <h2>Cambiar Contraseña</h2>
      
      {correo && (
        <div className="correo-info">
          <p>Actualizando contraseña para: <span>{correo}</span></p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nuevaContraseña">Nueva contraseña:</label>
          <div className="password-wrapper">
            <input
              id="nuevaContraseña"
              name="nuevaContraseña"
              type={showPassword ? "text" : "password"}
              value={nuevaContraseña}
              onChange={(e) => handleInputChange('nuevaContraseña', e.target.value)}
              required
              placeholder="Ingresa la nueva contraseña"
              className={getInputClassName('nuevaContraseña')}
            />
            <span 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          {/* Indicador de fortaleza */}
          {nuevaContraseña && (
            <>
              <div className="password-strength">
                <div className={`strength-bar strength-${fortaleza.nivel}`}></div>
              </div>
              <div className="strength-text">
                {fortaleza.nivel === "weak" && "Débil"}
                {fortaleza.nivel === "medium" && "Media"}
                {fortaleza.nivel === "strong" && "Fuerte"}
              </div>
            </>
          )}
          
          {errors.nuevaContraseña && (
            <span className="field-error">{errors.nuevaContraseña}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmar">Confirmar contraseña:</label>
          <div className="password-wrapper">
            <input
              id="confirmar"
              name="confirmar"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmar}
              onChange={(e) => handleInputChange('confirmar', e.target.value)}
              required
              placeholder="Repite la nueva contraseña"
              className={getInputClassName('confirmar')}
            />
            <span 
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmar && (
            <span className="field-error">{errors.confirmar}</span>
          )}
        </div>

        {/* Requisitos de contraseña */}
        <div className="password-requirements">
          <h4>La contraseña debe contener:</h4>
          <ul>
            <li className={nuevaContraseña.length >= 8 ? "valid" : "invalid"}>
              Mínimo 8 caracteres
            </li>
            <li className={/(?=.*[a-z])/.test(nuevaContraseña) ? "valid" : "invalid"}>
              Una letra minúscula
            </li>
            <li className={/(?=.*[A-Z])/.test(nuevaContraseña) ? "valid" : "invalid"}>
              Una letra mayúscula
            </li>
            <li className={/(?=.*\d)/.test(nuevaContraseña) ? "valid" : "invalid"}>
              Un número
            </li>
            <li className={/(?=.*[@$!%*?&])/.test(nuevaContraseña) ? "valid" : "invalid"}>
              Un carácter especial (@$!%*?&)
            </li>
          </ul>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={isLoading ? "button-loading" : ""}
        >
          {isLoading ? "Actualizando..." : "Guardar nueva contraseña"}
        </button>
      </form>

      {mensaje && (
        <p className={`mensaje ${mensaje.includes("✅") ? "success" : "error"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default CambiarContraseña;