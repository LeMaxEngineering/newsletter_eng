var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, NotFoundException } from '@nestjs/common';
let ProjectsService = class ProjectsService {
    projects = [
        {
            id: 'proj_001',
            name: 'Interactive Welcome Series',
            owner: 'Alicia Navarro',
            status: 'active',
            templateCount: 4,
            updatedAt: new Date().toISOString(),
            templates: [
                {
                    id: 'tmpl_hero',
                    name: 'Hero + Poll',
                    version: '1.3.2',
                    status: 'published',
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'tmpl_engage',
                    name: 'Engagement Digest',
                    version: '0.9.0',
                    status: 'draft',
                    updatedAt: new Date().toISOString()
                }
            ]
        },
        {
            id: 'proj_002',
            name: 'Product Launch Countdown',
            owner: 'Devon Kim',
            status: 'active',
            templateCount: 2,
            updatedAt: new Date().toISOString(),
            templates: [
                {
                    id: 'tmpl_launch',
                    name: 'Launch Day Blast',
                    version: '1.0.0',
                    status: 'draft',
                    updatedAt: new Date().toISOString()
                }
            ]
        }
    ];
    findAll() {
        return this.projects;
    }
    findOne(projectId) {
        const project = this.projects.find((item) => item.id === projectId);
        if (!project) {
            throw new NotFoundException(`Project ${projectId} not found`);
        }
        return project;
    }
    addTemplate(projectId, payload) {
        const project = this.findOne(projectId);
        const newTemplate = {
            id: `tmpl_${Math.random().toString(36).slice(2, 8)}`,
            name: payload.name,
            version: payload.version ?? '0.1.0',
            status: payload.status ?? 'draft',
            updatedAt: new Date().toISOString()
        };
        project.templates.push(newTemplate);
        project.templateCount = project.templates.length;
        project.updatedAt = new Date().toISOString();
        return newTemplate;
    }
};
ProjectsService = __decorate([
    Injectable()
], ProjectsService);
export { ProjectsService };
//# sourceMappingURL=projects.service.js.map