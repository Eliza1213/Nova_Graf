import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ActivarCuenta = ({ correo }) => {
  const navigate = useNavigate();
  const [codigoOTP, setCodigoOTP] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleVerificarOTP = async () => {
  try {
    const res = await fetch("https://novagraf-production-3bea.up.railway.app/api/auth/verificar-otp", { // ✅ cambiar ruta
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo: codigoOTP }),
    });
    const data = await res.json();
    setMensaje(data.message);

    if (res.status === 200) setTimeout(() => navigate("/login"), 1500);
  } catch (err) {
    setMensaje("Error al verificar OTP");
  }
};

const handleReenviarOTP = async () => {
  try {
    const res = await fetch("https://novagraf-production-3bea.up.railway.app/api/auth/reenviar-codigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });
    const data = await res.json();
    setMensaje(data.message);
  } catch (err) {
    setMensaje("Error al reenviar código");
  }
};


  return (
    <div className="otp-container">
      <h3>Activa tu cuenta: {correo}</h3>
      <input
        placeholder="Ingresa código OTP"
        value={codigoOTP}
        onChange={(e) => setCodigoOTP(e.target.value)}
      />
      <button onClick={handleVerificarOTP}>Verificar código</button>
      <button onClick={handleReenviarOTP}>Reenviar código</button>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default ActivarCuenta;
