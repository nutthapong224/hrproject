import React from 'react';
import { Navigate } from 'react-router-dom';



const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('userRole') // 'superadmin', 'admin', 'employee'

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(role)) {
    return role === 'employee' ? (
      <Navigate to="/home" replace />
    ) : (
      <Navigate to="/all-employees" replace />
    )
  }

  return children
}

export default PrivateRoute
