import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { Roles } from '../auth/roles.decorator.js';
import {
  CreateProjectInput,
  CreateTemplateInput,
  UpdateProjectInput,
  UpdateTemplateInput
} from './projects.types.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  listProjects() {
    return this.projectsService.findAll();
  }

  @Get(':projectId')
  getProject(@Param('projectId') projectId: string) {
    return this.projectsService.findOne(projectId);
  }

  @Post()
  @Roles('admin', 'editor')
  createProject(@Body() payload: CreateProjectInput) {
    return this.projectsService.createProject(payload);
  }

  @Patch(':projectId')
  @Roles('admin', 'editor')
  updateProject(@Param('projectId') projectId: string, @Body() payload: UpdateProjectInput) {
    return this.projectsService.updateProject(projectId, payload);
  }

  @Delete(':projectId')
  @Roles('admin')
  deleteProject(@Param('projectId') projectId: string) {
    return this.projectsService.deleteProject(projectId);
  }

  @Post(':projectId/templates')
  @Roles('admin', 'editor')
  createTemplate(@Param('projectId') projectId: string, @Body() payload: CreateTemplateInput) {
    return this.projectsService.addTemplate(projectId, payload);
  }

  @Patch(':projectId/templates/:templateId')
  @Roles('admin', 'editor')
  updateTemplate(
    @Param('projectId') projectId: string,
    @Param('templateId') templateId: string,
    @Body() payload: UpdateTemplateInput
  ) {
    return this.projectsService.updateTemplate(projectId, templateId, payload);
  }

  @Delete(':projectId/templates/:templateId')
  @Roles('admin')
  deleteTemplate(@Param('projectId') projectId: string, @Param('templateId') templateId: string) {
    return this.projectsService.deleteTemplate(projectId, templateId);
  }
}
