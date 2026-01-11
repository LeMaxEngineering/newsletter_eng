import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import type { UserRole } from './auth.types.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const headerValue = request.headers['x-user-roles'];

    const userRoles = this.parseRoles(headerValue);

    return requiredRoles.some((role) => userRoles.includes(role));
  }

  private parseRoles(headerValue: unknown): UserRole[] {
    if (Array.isArray(headerValue)) {
      return headerValue
        .flatMap((value) => value.split(','))
        .map((role) => role.trim())
        .filter(Boolean) as UserRole[];
    }

    if (typeof headerValue === 'string') {
      return headerValue
        .split(',')
        .map((role) => role.trim())
        .filter(Boolean) as UserRole[];
    }

    return [];
  }
}
