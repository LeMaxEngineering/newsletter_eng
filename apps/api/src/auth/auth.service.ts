import { Injectable } from '@nestjs/common';
import type { SessionPayload } from './auth.types.js';

@Injectable()
export class AuthService {
  getSession(): SessionPayload {
    return {
      userId: 'user_001',
      name: 'Alicia Navarro',
      email: 'alicia@example.com',
      tenantId: 'tenant_001',
      roles: ['admin'],
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
  }
}
