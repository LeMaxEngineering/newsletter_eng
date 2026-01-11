import { randomUUID } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type Database from 'better-sqlite3';
import { DATABASE } from '../database/database.module.js';
import {
  type ProjectSummary,
  type TemplateSummary,
  type CreateTemplateInput,
  type UpdateTemplateInput,
  type CreateProjectInput,
  type UpdateProjectInput
} from './projects.types.js';

interface ProjectRow {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'archived';
  updated_at: string;
}

interface TemplateRow {
  id: string;
  project_id: string;
  name: string;
  version: string;
  status: 'draft' | 'published';
  updated_at: string;
}

@Injectable()
export class ProjectsService {
  constructor(@Inject(DATABASE) private readonly db: Database.Database) {}

  findAll(): ProjectSummary[] {
    const rows = this.db
      .prepare<ProjectRow>('SELECT id, name, owner, status, updated_at FROM projects ORDER BY datetime(updated_at) DESC')
      .all();

    return rows.map((row) => this.hydrateProject(row));
  }

  findOne(projectId: string): ProjectSummary {
    const row = this.db
      .prepare<ProjectRow>('SELECT id, name, owner, status, updated_at FROM projects WHERE id = ?')
      .get(projectId);

    if (!row) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    return this.hydrateProject(row);
  }

  createProject(payload: CreateProjectInput): ProjectSummary {
    const id = `proj_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const status = payload.status ?? 'active';

    this.db
      .prepare(
        `INSERT INTO projects (id, name, owner, status, updated_at)
         VALUES (@id, @name, @owner, @status, @updatedAt)`
      )
      .run({
        id,
        name: payload.name,
        owner: payload.owner,
        status,
        updatedAt: now
      });

    return this.findOne(id);
  }

  updateProject(projectId: string, payload: UpdateProjectInput): ProjectSummary {
    const existing = this.db
      .prepare<ProjectRow>('SELECT id, name, owner, status, updated_at FROM projects WHERE id = ?')
      .get(projectId);

    if (!existing) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const updatedAt = new Date().toISOString();
    const next = {
      id: projectId,
      name: payload.name ?? existing.name,
      owner: payload.owner ?? existing.owner,
      status: payload.status ?? existing.status,
      updatedAt
    };

    this.db
      .prepare('UPDATE projects SET name=@name, owner=@owner, status=@status, updated_at=@updatedAt WHERE id=@id')
      .run(next);

    return this.findOne(projectId);
  }

  deleteProject(projectId: string) {
    const result = this.db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    if (!result.changes) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    return { deleted: true };
  }

  addTemplate(projectId: string, payload: CreateTemplateInput): TemplateSummary {
    this.ensureProjectExists(projectId);
    const id = `tmpl_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO templates (id, project_id, name, version, status, updated_at)
         VALUES (@id, @projectId, @name, @version, @status, @updatedAt)`
      )
      .run({
        id,
        projectId,
        name: payload.name,
        version: payload.version ?? '0.1.0',
        status: payload.status ?? 'draft',
        updatedAt: now
      });

    this.touchProject(projectId);

    return this.getTemplate(projectId, id);
  }

  updateTemplate(projectId: string, templateId: string, payload: UpdateTemplateInput): TemplateSummary {
    this.ensureProjectExists(projectId);
    const existing = this.db
      .prepare<TemplateRow>('SELECT id, project_id, name, version, status, updated_at FROM templates WHERE id = ?')
      .get(templateId);

    if (!existing || existing.project_id !== projectId) {
      throw new NotFoundException(`Template ${templateId} not found in project ${projectId}`);
    }

    const updatedAt = new Date().toISOString();
    const next = {
      id: templateId,
      name: payload.name ?? existing.name,
      version: payload.version ?? existing.version,
      status: payload.status ?? existing.status,
      updatedAt
    };

    this.db
      .prepare(
        'UPDATE templates SET name=@name, version=@version, status=@status, updated_at=@updatedAt WHERE id=@id'
      )
      .run(next);

    this.touchProject(projectId);

    return this.getTemplate(projectId, templateId);
  }

  deleteTemplate(projectId: string, templateId: string) {
    this.ensureProjectExists(projectId);
    const result = this.db.prepare('DELETE FROM templates WHERE id = ? AND project_id = ?').run(templateId, projectId);
    if (!result.changes) {
      throw new NotFoundException(`Template ${templateId} not found in project ${projectId}`);
    }
    this.touchProject(projectId);
    return { deleted: true };
  }

  private hydrateProject(row: ProjectRow): ProjectSummary {
    const templates = this.getTemplates(row.id);
    return {
      id: row.id,
      name: row.name,
      owner: row.owner,
      status: row.status,
      templateCount: templates.length,
      updatedAt: row.updated_at,
      templates
    };
  }

  private getTemplates(projectId: string): TemplateSummary[] {
    const rows = this.db
      .prepare<TemplateRow>(
        'SELECT id, project_id, name, version, status, updated_at FROM templates WHERE project_id = ? ORDER BY datetime(updated_at) DESC'
      )
      .all(projectId);

    return rows.map((row) => this.mapTemplate(row));
  }

  private getTemplate(projectId: string, templateId: string): TemplateSummary {
    const row = this.db
      .prepare<TemplateRow>(
        'SELECT id, project_id, name, version, status, updated_at FROM templates WHERE id = ? AND project_id = ?'
      )
      .get(templateId, projectId);

    if (!row) {
      throw new NotFoundException(`Template ${templateId} not found in project ${projectId}`);
    }

    return this.mapTemplate(row);
  }

  private mapTemplate(row: TemplateRow): TemplateSummary {
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      status: row.status,
      updatedAt: row.updated_at
    };
  }

  private ensureProjectExists(projectId: string) {
    const exists = this.db.prepare('SELECT 1 FROM projects WHERE id = ?').get(projectId);
    if (!exists) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
  }

  private touchProject(projectId: string) {
    const updatedAt = new Date().toISOString();
    this.db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(updatedAt, projectId);
  }
}
