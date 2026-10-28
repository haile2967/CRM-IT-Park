import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  useEffect(() => {
    login();
  }, [login]);

  return <div className="min-h-screen w-full bg-slate-50" />;
};

export default LoginPage;
