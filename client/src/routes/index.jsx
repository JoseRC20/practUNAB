import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Body from '../components/Body';
import Login from '../auth/Login';
import Registro from '../auth/Registro';
import PerfilAlumno from '../components_Alumno/PerfilAlumno';
import FormAlumno from '../components_Alumno/FormAlumno';
import Hitos from '../components_Alumno/Hitos';
import HomeAlumno from '../components_Alumno/HomeAlumno';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Body />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/registro" element={<Registro/>} />
            <Route path="/perfil/alumno" element={<PerfilAlumno/>} />
            <Route path="/form-alumno" element={<FormAlumno/>} />
            <Route path="/hitos" element={<Hitos/>} />
            <Route path="/HomeAlumno" element={<HomeAlumno />}/>
        </Routes>
    );
};

export default AppRoutes;