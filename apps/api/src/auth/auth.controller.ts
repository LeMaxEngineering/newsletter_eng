import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  getSession() {
    return this.authService.getSession();
  }
}
