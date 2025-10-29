import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Footer() {
    return (
        <footer className="footer mt-5 py-3" style={{backgroundColor: '#313131ff'}}>
            <div className="container text-center">
                <span className="text-white">&copy; 2025 practUNAB. Todos los derechos reservados.</span>
            </div>
        </footer>
    );
}