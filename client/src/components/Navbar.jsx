import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogoU from '../assets/Logo_Uandresbello.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { token, clearToken } = useAuth();
    const navigate = useNavigate();
    const isLoggedIn = !!token;
    const role = localStorage.getItem('userRole'); // Recupera el rol desde localStorage

    const handleLogout = () => {
        clearToken();
        localStorage.removeItem('userRole');
        // navigate to login or home
        navigate('/');
    };

    return (
        <div className="d-flex">
            <nav className="navbar navbar-expand-lg w-100" style={{ backgroundColor: '#be0000ff' }}>
                <div className="d-flex align-items-center">
                    <img src={LogoU} alt="Logo U" style={{ width: '89px', marginRight: '10px', marginLeft: '20px', marginBottom: '9px' }} />
                    <a className="navbar-brand"> {/* Ajusta el href dinámicamente */}
                        <h1 className='text-white'>practUNAB</h1>
                    </a>
                </div>
                {isLoggedIn && role === 'admin' || role === 'secretary' && (
                    <button className="btn btn-outline-light ms-auto me-3" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                )}
            </nav>
        </div>
    );
}