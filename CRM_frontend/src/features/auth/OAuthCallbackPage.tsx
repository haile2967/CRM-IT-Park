import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { authService } from '../../services/authService';
import { Loader2 } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const encodedUser = searchParams.get('user');
      const error = searchParams.get('error');
      const status = searchParams.get('status');

      if (status === 'error' || error) {
        navigate('/login', {
          replace: true,
          state: { errorMessage: error || 'Authentication failed. Please try again.' },
        });
        return;
      }

      if (token) {
        try {
          let userProfile = null;

          if (encodedUser) {
            try {
              userProfile = JSON.parse(atob(decodeURIComponent(encodedUser)));
            } catch {
              userProfile = null;
            }
          }

          if (!userProfile) {
            localStorage.setItem('crm_token', token);
            userProfile = await authService.getMe();
          }

          setAuthSession(token, userProfile);
          navigate('/dashboard', { replace: true });
        } catch {
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
          navigate('/login', {
            replace: true,
            state: { errorMessage: 'Could not load user profile. Please try signing in again.' },
          });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [searchParams, navigate, setAuthSession]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
    </div>
  );
};

export default OAuthCallbackPage;
