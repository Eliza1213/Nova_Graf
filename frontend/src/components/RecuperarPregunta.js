import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RecuperarPregunta = () => {
  const navigate = useNavigate();
  const correoRecuperacion = localStorage.getItem("correoRecuperacion");

  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!correoRecuperacion) navigate("/recuperar"); // Si no hay correo, regresar
    else obtenerPregunta();
  }, []);

  const obtenerPregunta = async () => {
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/obtener-pregunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoRecuperacion }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (res.status === 200) {
        setPregunta(data.pregunta);
      }
    } catch (err) {
      setMensaje("Error al obtener la pregunta secreta.");
    }
  };

  const handleVerificarRespuesta = async () => {
    try {
      const res = await fetch("https://novagraf-production.up.railway.app/api/auth/verificar-respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoRecuperacion, respuesta }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (res.status === 200) navigate("/cambiar-contrasena");
    } catch (err) {
      setMensaje("Error al verificar la respuesta.");
    }
  };

  return (
    <div className="recuperar-container">
      <h2>Recuperar Contraseña por Pregunta Secreta</h2>

      {pregunta ? (
        <div>
          <p>Pregunta: {pregunta}</p>
          <input
            type="text"
            placeholder="Ingresa la respuesta"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
          />
          <button onClick={handleVerificarRespuesta}>Verificar respuesta</button>
        </div>
      ) : (
        <p>Obteniendo pregunta...</p>
      )}

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default RecuperarPregunta;
