// src/components/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaSignOutAlt } from 'react-icons/fa'; // Iconos de cierre de sesión

import "../Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handlePersonalizar = () => {
    navigate("/personalizar"); 
  };

  return (
    <div className="full-screen-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <ul>
          <li>Descargables</li>
          <li>Etiqueta Empresarial</li>
          <li>Impresión Digital</li>
        </ul>
        <div className="nav-icons">
          <FaSearch />
          <FaUser onClick={handleLogout} title="Cerrar sesión" style={{ cursor: 'pointer' }} />
          <FaShoppingCart />
        </div>
      </nav>

      {/* Nova Graf Logo and Large Text */}
      <header className="home-header">
        <div className="logo">
          <h1>Nova Graf</h1>
          <FaSignOutAlt 
            className="logout-icon" 
            onClick={handleLogout} 
            title="Cerrar sesión" 
            style={{ cursor: 'pointer', fontSize: '2rem' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Aquí iría el resto de tu contenido */}
      </main>
    </div>
  );
};

export default Home;
