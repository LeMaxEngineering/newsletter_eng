export type UserRole = 'admin' | 'editor' | 'analyst';

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  tenantId: string;
  roles: UserRole[];
  expiresAt: string;
}
