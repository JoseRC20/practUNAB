import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Footer() {
    // Ensure page content doesn't get hidden behind the fixed footer
    useEffect(() => {
        const prev = document.body.style.paddingBottom;
        // Match the footer height (in px)
        document.body.style.paddingBottom = '70px';
        return () => { document.body.style.paddingBottom = prev; };
    }, []);

    return (
        <footer
            className="footer py-3"
            style={{
                backgroundColor: '#2E3641',
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                height: '70px'
            }}
        >
            <div className="container text-center">
                <span className="text-white">&copy; 2025 practUNAB. Todos los derechos reservados.</span>
            </div>
        </footer>
    );
}