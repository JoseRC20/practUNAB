import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogoU from '../assets/Logo_Uandresbello.png';

export default function Navbar() {
    const [isLogggedIn, setIsLoggedIn] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Estado para mostrar el Sidebar
    const role = localStorage.getItem('userRole'); // Recupera el rol desde localStorage

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar); // Alterna el estado del Sidebar
    };

    return (
        <div className="d-flex">
            <nav className="navbar navbar-expand-lg w-100" style={{ backgroundColor: '#be0000ff' }}>
                <div className="d-flex align-items-center">
                    <img src={LogoU} alt="Logo U" style={{ width: '89px', marginRight: '10px', marginLeft: '15px', marginBottom: '9px' }} />
                    <a className="navbar-brand"> {/* Ajusta el href dinámicamente */}
                        <h1 className='text-white'>practUNAB</h1>
                    </a>
                </div>
            </nav>
        </div>
    );
}