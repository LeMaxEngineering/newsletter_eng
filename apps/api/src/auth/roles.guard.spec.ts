import { describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

function createContext(headers: Record<string, string | string[] | undefined>): ExecutionContext {
  const request = { headers };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({} as never)
    }),
    getHandler: () => ({} as never),
    getClass: () => ({} as never),
    getType: () => 'http',
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({} as never),
    switchToWs: () => ({} as never)
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined)
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createContext({});

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when headers include a required role', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['admin'])
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createContext({ 'x-user-roles': 'admin,editor' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies access when user roles are missing', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['editor'])
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = createContext({ 'x-user-roles': 'analyst' });

    expect(guard.canActivate(context)).toBe(false);
  });
});
