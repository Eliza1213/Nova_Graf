// src/components/NuevaContraseña.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const NuevaContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/auth/nueva-contraseña", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nuevaContraseña }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (res.status === 200) {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      setMensaje("Error al cambiar la contraseña.");
    }
  };

  return (
    <div className="nueva-container">
      <h2>Establecer Nueva Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label>Correo:</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label>Nueva contraseña:</label>
        <input
          type="password"
          value={nuevaContraseña}
          onChange={(e) => setNuevaContraseña(e.target.value)}
          required
        />

        <button type="submit">Cambiar Contraseña</button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default NuevaContraseña;
