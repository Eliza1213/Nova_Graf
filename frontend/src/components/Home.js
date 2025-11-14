// src/components/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaUser, 
  FaShoppingCart, 
  FaSignOutAlt,
  FaPalette,
  FaPrint,
  FaTags,
  FaDownload,
  FaShieldAlt,
  FaRocket,
  FaAward,
  FaUserCircle
} from 'react-icons/fa';

import "../Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePersonalizar = () => {
    navigate("/home"); 
  };

  const handleServiceClick = (service) => {
    console.log(`Navegando a: ${service}`);
  };

  return (
    <div className="full-screen-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo-nav">
            <h2>Nova Graf</h2>
          </div>
          <ul>
            <li>Descargables</li>
            <li>Etiqueta Empresarial</li>
            <li>Impresión Digital</li>
            <li>Diseño Gráfico</li>
            <li>Contacto</li>
            <li>Mi perfil</li>
            <li>Configuración</li>
          </ul>
        </div>
        <div className="nav-icons">
          <FaSearch className="nav-icon-item" title="Buscar" />
          <FaShoppingCart className="nav-icon-item" title="Carrito de compras" />
          
       
          {/* Botón de Cerrar Sesión */}
          <button className="logout-button" onClick={handleLogout} title="Cerrar Sesión">
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Nova Graf Bienvenido */}
      <header className="home-header">
        <div className="logo">
          <h1>Bienvenido a Nova Graf</h1>
        </div>
        
        <div className="welcome-section">
          <h2>La Revolución Gráfica</h2>
          <p>
            Descubre un mundo de posibilidades en diseño e impresión. 
            Donde la creatividad se encuentra con la tecnología para dar vida a tus ideas.
          </p>
          <button className="cta-button" onClick={handlePersonalizar}>
            Comenzar a Personalizar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <FaPalette className="feature-icon" />
            <h3>Diseño Personalizado</h3>
            <p>Crea diseños únicos que reflejen la esencia de tu marca con nuestras herramientas avanzadas.</p>
            <button className="feature-button" onClick={() => handleServiceClick("Diseño")}>
              Explorar
            </button>
          </div>
          
          <div className="feature-card">
            <FaPrint className="feature-icon" />
            <h3>Impresión de Calidad</h3>
            <p>Obtén resultados impecables con nuestra tecnología de impresión de última generación.</p>
            <button className="feature-button" onClick={() => handleServiceClick("Impresión")}>
              Ver Opciones
            </button>
          </div>
          
          <div className="feature-card">
            <FaTags className="feature-icon" />
            <h3>Etiquetas Profesionales</h3>
            <p>Desarrolla etiquetas que destaquen tus productos y comuniquen tu valor profesional.</p>
            <button className="feature-button" onClick={() => handleServiceClick("Etiquetas")}>
              Crear Etiqueta
            </button>
          </div>
        </div>

        {/* Services Section */}
        <div className="services-section">
          <h2>Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-item">
              <FaDownload className="service-icon" />
              <h3>Material Descargable</h3>
              <p>Plantillas y recursos listos para usar</p>
            </div>
            
            <div className="service-item">
              <FaShieldAlt className="service-icon" />
              <h3>Branding Corporativo</h3>
              <p>Desarrollo completo de identidad visual</p>
            </div>
            
            <div className="service-item">
              <FaRocket className="service-icon" />
              <h3>Soluciones Rápidas</h3>
              <p>Entrega express para proyectos urgentes</p>
            </div>
            
            <div className="service-item">
              <FaAward className="service-icon" />
              <h3>Calidad Premium</h3>
              <p>Materiales y acabados de primera calidad</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Nova Graf</h3>
            <p>Líderes en soluciones gráficas innovadoras para empresas y profesionales.</p>
          </div>
          
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>Email: info@novagraf.com</p>
            <p>Teléfono: +1 234 567 890</p>
            <p>Dirección: Av. Principal 123</p>
          </div>
          
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="#services">Servicios</a></li>
              <li><a href="#about">Nosotros</a></li>
              <li><a href="#portfolio">Portafolio</a></li>
              <li><a href="#contact">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Nova Graf. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;