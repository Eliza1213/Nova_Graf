import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerificarCodigo = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [reenviando, setReenviando] = useState(false);
  const correo = localStorage.getItem("correoRecuperacion");

  // 🔹 Verificar el código ingresado
  const handleVerificar = async (e) => {
    e.preventDefault();
    console.log("Enviando:", { correo, codigo });

    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (res.status === 200) {
        setTimeout(() => navigate("/cambiar-contrasena"), 1000);
      }
    } catch (err) {
      setMensaje("❌ Error al verificar el código. Intenta nuevamente.");
    }
  };

  // 🔹 Reenviar código si expiró o el usuario lo solicita
  const handleReenviarCodigo = async () => {
    setReenviando(true);
    setMensaje("");

    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/reenviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      setMensaje(data.message || "Se ha reenviado el código a tu correo.");
    } catch (err) {
      setMensaje("❌ No se pudo reenviar el código. Intenta más tarde.");
    }

    setReenviando(false);
  };

  return (
    <div className="verificar-container">
      <h2>Verificar Código</h2>
      <p>
        Ingresa el código que fue enviado a tu correo: <strong>{correo}</strong>
      </p>

      <form onSubmit={handleVerificar}>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código de 6 dígitos"
          required
        />
        <button type="submit">Verificar</button>
      </form>

      <button
        type="button"
        onClick={handleReenviarCodigo}
        disabled={reenviando}
        style={{
          marginTop: "10px",
          backgroundColor: "#007bff",
          color: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {reenviando ? "Reenviando..." : "Reenviar código"}
      </button>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};




export default VerificarCodigo;
