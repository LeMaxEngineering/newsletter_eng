import type { UserRole } from '../types/auth.js';

export function hasRequiredRole(userRoles: UserRole[] | undefined, requiredRoles?: UserRole[]) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  return requiredRoles.some((role) => userRoles.includes(role));
}
