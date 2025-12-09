import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Register from './pages/Register';


interface PrivateRouteProps {
  children: React.ReactNode; 
  role: string;              
}


const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;
  if (role && userRole !== role) {
    return <Navigate to="/" />; 
  } 

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={
        <PrivateRoute role="admin">
          <AdminDashboard />
        </PrivateRoute>
      } />
  
      <Route path="/staff" element={
        <PrivateRoute role="staff">
          <StaffDashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;