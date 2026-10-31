import { useAuth } from './useAuth';

export const usePermission = () => {
  const { user } = useAuth();

  const isSuperAdmin = Boolean(
    user?.is_admin ||
    user?.role?.role_name === 'System Administrator' ||
    user?.roles?.includes('System Administrator')
  );

  const permissions = user?.permissions || [];
  const roles = user?.roles || (user?.role?.role_name ? [user.role.role_name] : []);

  /**
   * Check if the authenticated user has a specific permission or all of an array of permissions.
   * System Administrators always return true (super-admin bypass).
   */
  const can = (permission: string | string[]): boolean => {
    if (isSuperAdmin) return true;
    if (!permissions.length) return false;

    if (Array.isArray(permission)) {
      return permission.every((p) => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  /**
   * Check if the authenticated user has ANY of the specified permissions.
   */
  const canAny = (permissionList: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (!permissions.length) return false;

    return permissionList.some((p) => permissions.includes(p));
  };

  /**
   * Check if the authenticated user holds a given role (or any of the listed roles).
   */
  const hasRole = (role: string | string[]): boolean => {
    if (Array.isArray(role)) {
      return role.some((r) => roles.includes(r));
    }
    return roles.includes(role);
  };

  return {
    can,
    canAny,
    hasRole,
    isSuperAdmin,
    permissions,
    roles,
    user,
  };
};

export default usePermission;

