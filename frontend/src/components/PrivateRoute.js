import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem', fontSize: '1.2rem' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};
export default PrivateRoute;
