// src/components/NuevaContraseña.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';


const NuevaContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

   const handleVolver = () => {
    navigate("/login");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://nova-graf.onrender.com/api/auth/nueva-contraseña", {
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

         
              <div className="volver-link">
                <span onClick={handleVolver}>
                  <FaArrowLeft style={{ marginRight: '8px' }} />
                  Volver al inicio de sesión
                </span>
              </div>
      </form>
      

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default NuevaContraseña;
