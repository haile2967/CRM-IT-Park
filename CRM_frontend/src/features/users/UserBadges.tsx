import React from 'react';
import Badge from '../../components/ui/Badge';
import type { UserStatus } from '../../types/user';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  if (status === 'active') {
    return (
      <Badge variant="emerald" size="sm" dot>
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="rose" size="sm" dot>
      Inactive
    </Badge>
  );
};

interface UserRoleBadgeProps {
  roleName?: string;

}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ roleName }) => {
  if (!roleName) {
    return (
      <Badge variant="slate" size="sm">
        Unassigned
      </Badge>
    );
  }

  const normalized = roleName.toLowerCase();

  if (normalized.includes('admin')) {
    return (
      <Badge variant="purple" size="sm">
        {roleName}
      </Badge>
    );
  }

  if (normalized.includes('manager')) {
    return (
      <Badge variant="blue" size="sm">
        {roleName}
      </Badge>
    );
  }

  if (normalized.includes('development') || normalized.includes('officer') || normalized.includes('bdo')) {
    return (
      <Badge variant="emerald" size="sm">
        {roleName}
      </Badge>
    );
  }

  if (normalized.includes('support') || normalized.includes('agent')) {
    return (
      <Badge variant="amber" size="sm">
        {roleName}
      </Badge>
    );
  }

  return (
    <Badge variant="slate" size="sm">
      {roleName}
    </Badge>
  );
};

export default UserStatusBadge;
