import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProjectsController } from './projects/projects.controller.js';
import { ProjectsService } from './projects/projects.service.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { RolesGuard } from './auth/roles.guard.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, ProjectsController, AuthController],
  providers: [
    AppService,
    ProjectsService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
