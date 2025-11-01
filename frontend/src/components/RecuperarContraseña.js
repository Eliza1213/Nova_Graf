import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaKey, FaArrowLeft } from 'react-icons/fa';
import "../RecuperarContraseña.css";

const RecuperarContraseña = () => {
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState("correo");

  const handleElegir = () => {
    localStorage.setItem("metodoRecuperacion", opcion);
    navigate("/ingresar-correo");
  };

  const handleVolver = () => {
    navigate("/login");
  };

  return (
    <div className="recuperar-container">
      {/* Icono decorativo */}
      <div className="recuperar-icono">
        <FaKey />
      </div>
      
      <h2>Recuperar Contraseña</h2>
      
      <div className="form-group">
        <label htmlFor="metodo">Método de recuperación:</label>
        <select 
          id="metodo"
          value={opcion} 
          onChange={(e) => setOpcion(e.target.value)}
        >
          <option value="correo">Enviar código al correo</option>
          <option value="pregunta">Pregunta secreta</option>
        </select>
      </div>
      
      <button onClick={handleElegir}>
        Continuar
      </button>
      
      <div className="volver-link">
        <span onClick={handleVolver}>
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Volver al inicio de sesión
        </span>
      </div>
    </div>
  );
};

export default RecuperarContraseña;