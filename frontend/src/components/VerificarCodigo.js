import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../verificarCodigo.css";

const VerificarCodigo = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [reenviando, setReenviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState(300); // 5 minutos en segundos
  const correo = localStorage.getItem("correoRecuperacion");

  // Contador de tiempo
  useEffect(() => {
    if (tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante]);

  // Formatear tiempo en minutos y segundos
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Validación del código
  const validarCodigo = (codigo) => {
    if (!codigo.trim()) {
      return "El código es obligatorio";
    }
    if (codigo.length !== 6) {
      return "El código debe tener 6 dígitos";
    }
    if (!/^\d+$/.test(codigo)) {
      return "El código debe contener solo números";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Solo números, máximo 6 dígitos
    setCodigo(value);
    
    // Validación en tiempo real
    const error = validarCodigo(value);
    setError(error);
    
    // Limpiar mensaje cuando el usuario empiece a escribir
    if (mensaje && value) {
      setMensaje("");
    }
  };

  // 🔹 Verificar el código ingresado
  const handleVerificar = async (e) => {
    e.preventDefault();
    setVerificando(true);

    // Validación antes de enviar
    const errorValidacion = validarCodigo(codigo);
    if (errorValidacion) {
      setError(errorValidacion);
      setMensaje("");
      
      // Efecto shake en el input
      const input = document.querySelector('.verificar-container input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
      
      setVerificando(false);
      return;
    }

    console.log("Enviando:", { correo, codigo });

    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/verificar-codigo-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      const data = await res.json();
      
      if (res.status === 200) {
        setMensaje("✅ Código verificado correctamente. Redirigiendo...");
        setError("");
        setTimeout(() => navigate("/cambiar-contrasena"), 1000);
      } else {
        setMensaje(data.message || "❌ Código incorrecto o expirado");
        setError("Verifica el código e intenta nuevamente");
      }
    } catch (err) {
      setMensaje("❌ Error de conexión al verificar el código");
      setError("No se pudo conectar con el servidor");
    } finally {
      setVerificando(false);
    }
  };

  // 🔹 Reenviar código si expiró o el usuario lo solicita
  const handleReenviarCodigo = async () => {
    setReenviando(true);
    setMensaje("");
    setError("");

    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/reenviar-codigo-recuperacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      
      if (res.status === 200) {
        setMensaje("✅ Código reenviado correctamente. Revisa tu correo.");
        setTiempoRestante(300); // Reiniciar contador a 5 minutos
      } else {
        setMensaje(data.message || "❌ Error al reenviar el código");
      }
    } catch (err) {
      setMensaje("❌ No se pudo reenviar el código. Intenta más tarde.");
    } finally {
      setReenviando(false);
    }
  };

  // Función para obtener clase CSS del input
  const getInputClassName = () => {
    if (error) return "error";
    if (codigo && !error) return "valid";
    return "";
  };

  return (
    <div className="verificar-container">
      <h2>Verificar Código</h2>
      <p>
        Ingresa el código que fue enviado a tu correo: <strong>{correo}</strong>
      </p>

      {/* Contador de tiempo */}
      {tiempoRestante > 0 && (
        <div className="timer-container">
          <p>
            El código expira en: <span className="timer">{formatearTiempo(tiempoRestante)}</span>
          </p>
        </div>
      )}

      {tiempoRestante <= 0 && (
        <div className="timer-container">
          <p className="pulse">⚠️ El código ha expirado. Por favor, solicita uno nuevo.</p>
        </div>
      )}

      <form onSubmit={handleVerificar}>
        <input
          type="text"
          value={codigo}
          onChange={handleInputChange}
          placeholder="Código de 6 dígitos"
          required
          className={getInputClassName()}
          maxLength={6}
        />
        
        {error && <span className="field-error">{error}</span>}

        <button 
          type="submit" 
          disabled={verificando || tiempoRestante <= 0}
          className={verificando ? "button-loading" : ""}
        >
          {verificando ? "Verificando..." : "Verificar Código"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleReenviarCodigo}
        disabled={reenviando || tiempoRestante > 120} // Solo permitir reenviar si quedan menos de 2 minutos
        className="reenviar-btn"
      >
        {reenviando ? "Reenviando..." : "Reenviar Código"}
      </button>

      {mensaje && (
        <p className={`mensaje ${mensaje.includes("✅") ? "success" : "error"}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default VerificarCodigo;