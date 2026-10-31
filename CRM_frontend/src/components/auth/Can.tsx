import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface CanProps {
  permission?: string | string[];
  role?: string | string[];
  any?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative Authorization Guard Component.
 * Conditionally renders children if the authenticated user has the required permission(s) or role(s).
 */
export const Can: React.FC<CanProps> = ({
  permission,
  role,
  any = false,
  fallback = null,
  children,
}) => {
  const { can, canAny, hasRole } = usePermission();

  // If role check specified, test role
  if (role) {
    if (!hasRole(role)) {
      return <>{fallback}</>;
    }
  }

  // If permission check specified, test permissions
  if (permission) {
    if (Array.isArray(permission) && any) {
      if (!canAny(permission)) {
        return <>{fallback}</>;
      }
    } else {
      if (!can(permission)) {
        return <>{fallback}</>;
      }
    }
  }

  return <>{children}</>;
};

export default Can;

