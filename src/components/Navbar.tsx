import React from 'react';
import '../styles/NavBar.css';
import { FaFilter } from "@react-icons/all-files/fa/FaFilter";



const Navbar: React.FC = () => {
  return (
    <div className="navbar">
      <div className="navbar-logo">WhatsApp Clone</div>
      <FaFilter className="navbar-icon" />
      <div className="navbar-menu">
        <button className="navbar-button">Perfil</button>
        <button className="navbar-button">Configuración</button>
      </div>
    </div>
  );
};

export default Navbar;
