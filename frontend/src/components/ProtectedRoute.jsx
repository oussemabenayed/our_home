import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { t } = useTranslation();
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;