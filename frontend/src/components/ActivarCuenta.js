import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../activar-cuenta.css";

const ActivarCuenta = ({ correo }) => {
  const navigate = useNavigate();
  const [codigoOTP, setCodigoOTP] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Validación del código OTP
  const validarOTP = (codigo) => {
    if (!codigo.trim()) {
      return "El código OTP es obligatorio";
    }
    if (codigo.length < 6) {
      return "El código OTP debe tener al menos 6 caracteres";
    }
    if (!/^[0-9a-zA-Z]+$/.test(codigo)) {
      return "El código OTP solo puede contener números y letras";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCodigoOTP(value);
    
    // Validación en tiempo real
    const error = validarOTP(value);
    setError(error);
    
    // Limpiar mensaje cuando el usuario empiece a escribir
    if (mensaje && value) {
      setMensaje("");
    }
  };

  const handleVerificarOTP = async () => {
    // Validación antes de enviar
    const errorValidacion = validarOTP(codigoOTP);
    if (errorValidacion) {
      setError(errorValidacion);
      setMensaje("");
      
      // Efecto shake en el input
      const input = document.querySelector('.otp-container input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/verificar-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo: codigoOTP }),
      });
      
      const data = await res.json();
      
      if (res.status === 200) {
        setMensaje("✅ Cuenta activada correctamente. Redirigiendo...");
        setError("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMensaje(data.message || "Error al verificar el código");
        setError("El código es incorrecto o ha expirado");
      }
    } catch (err) {
      setMensaje("❌ Error de conexión al verificar el código");
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarOTP = async () => {
    setIsResending(true);
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/reenviar-codigo-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      
      const data = await res.json();
      
      if (res.status === 200) {
        setMensaje("✅ Código reenviado correctamente. Revisa tu correo.");
        setError("");
      } else {
        setMensaje(data.message || "Error al reenviar el código");
      }
    } catch (err) {
      setMensaje("❌ Error de conexión al reenviar el código");
    } finally {
      setIsResending(false);
    }
  };

  // Función para obtener clase CSS del input
  const getInputClassName = () => {
    if (error) return "error";
    if (codigoOTP && !error) return "valid";
    return "";
  };

  return (
    <div className="otp-container">
      <h3>
        Activa tu cuenta: <span>{correo}</span>
      </h3>
      
      <input
        placeholder="Ingresa el código OTP de 6 dígitos"
        value={codigoOTP}
        onChange={handleInputChange}
        className={getInputClassName()}
        maxLength={6}
      />
      
      {error && <span className="field-error">{error}</span>}
      
      <button 
        onClick={handleVerificarOTP}
        disabled={isLoading}
        className={isLoading ? "button-loading" : ""}
      >
        {isLoading ? "Verificando..." : "Verificar código"}
      </button>
      
      <button 
        onClick={handleReenviarOTP}
        disabled={isResending}
        className={isResending ? "button-loading" : ""}
      >
        {isResending ? "Enviando..." : "Reenviar código"}
      </button>
      
      {mensaje && (
        <p className={mensaje.includes("✅") ? "success" : "error"}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default ActivarCuenta;