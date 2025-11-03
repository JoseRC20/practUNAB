import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Body from '../components/Body';
import Login from '../auth/Login';
import PerfilAlumno from '../components_Alumno/PerfilAlumno';
import FormAlumno from '../components_Alumno/FormAlumno';
import Hitos from '../components_Alumno/Hitos';
import HomeAlumno from '../components_Alumno/HomeAlumno';
import GestionUser from '../components_Admin/GestionUser';
import DashboardSecretaria from '../components_Secretaria/DashboardSecretaria';
import ViewForm from '../components_Secretaria/ViewForm';
import ListStudents from '../components_Professor/ListStudents';
import StudentPage from '../components_Professor/StudentPage';


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Body />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil/alumno" element={<PerfilAlumno/>} />
            <Route path="/form-alumno" element={<FormAlumno/>} />
            <Route path="/hitos" element={<Hitos/>} />
            <Route path="/HomeAlumno" element={<HomeAlumno />}/>
            <Route path="/GestionUser" element={<GestionUser />} />
            <Route path="/DashboardSecretaria" element={<DashboardSecretaria />} />
            {/* support both /secretary/viewForm/:id and /secretary/view/:id for compatibility */}
            <Route path="/secretary/viewForm/:id" element={<ViewForm />} />
            {/* alias route so older links like /secretary/view/:id still work */}
            <Route path="/secretary/view/:id" element={<ViewForm />} />
            <Route path="/professor/dashboard" element={<ListStudents />} />
            <Route path="/professor/student/:id" element={<StudentPage />} />

            
        </Routes>
    );
};

export default AppRoutes;