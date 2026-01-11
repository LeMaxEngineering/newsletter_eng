import { randomUUID } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Pool } from 'pg';
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
  constructor(@Inject(DATABASE) private readonly db: Pool) {}

  async findAll(): Promise<ProjectSummary[]> {
    const { rows } = await this.db.query<ProjectRow>(
      'SELECT id, name, owner, status, updated_at FROM projects ORDER BY updated_at DESC'
    );
    return Promise.all(rows.map((row) => this.hydrateProject(row)));
  }

  async findOne(projectId: string): Promise<ProjectSummary> {
    const { rows } = await this.db.query<ProjectRow>(
      'SELECT id, name, owner, status, updated_at FROM projects WHERE id = $1',
      [projectId]
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    return this.hydrateProject(row);
  }

  async createProject(payload: CreateProjectInput): Promise<ProjectSummary> {
    const id = `proj_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const status = payload.status ?? 'active';

    await this.db.query(
      `INSERT INTO projects (id, name, owner, status, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, payload.name, payload.owner, status, now]
    );

    return this.findOne(id);
  }

  async updateProject(projectId: string, payload: UpdateProjectInput): Promise<ProjectSummary> {
    const project = await this.findOne(projectId);
    const updatedAt = new Date().toISOString();

    await this.db.query(
      `UPDATE projects
       SET name = $1, owner = $2, status = $3, updated_at = $4
       WHERE id = $5`,
      [
        payload.name ?? project.name,
        payload.owner ?? project.owner,
        payload.status ?? project.status,
        updatedAt,
        projectId
      ]
    );

    return this.findOne(projectId);
  }

  async deleteProject(projectId: string) {
    const result = await this.db.query('DELETE FROM projects WHERE id = $1', [projectId]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    return { deleted: true };
  }

  async addTemplate(projectId: string, payload: CreateTemplateInput): Promise<TemplateSummary> {
    await this.ensureProjectExists(projectId);
    const id = `tmpl_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    await this.db.query(
      `INSERT INTO templates (id, project_id, name, version, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, projectId, payload.name, payload.version ?? '0.1.0', payload.status ?? 'draft', now]
    );

    await this.touchProject(projectId);

    return this.getTemplate(projectId, id);
  }

  async updateTemplate(projectId: string, templateId: string, payload: UpdateTemplateInput): Promise<TemplateSummary> {
    await this.ensureProjectExists(projectId);
    const template = await this.getTemplate(projectId, templateId);
    const updatedAt = new Date().toISOString();

    await this.db.query(
      `UPDATE templates
       SET name = $1, version = $2, status = $3, updated_at = $4
       WHERE id = $5 AND project_id = $6`,
      [
        payload.name ?? template.name,
        payload.version ?? template.version,
        payload.status ?? template.status,
        updatedAt,
        templateId,
        projectId
      ]
    );

    await this.touchProject(projectId);

    return this.getTemplate(projectId, templateId);
  }

  async deleteTemplate(projectId: string, templateId: string) {
    await this.ensureProjectExists(projectId);
    const result = await this.db.query('DELETE FROM templates WHERE id = $1 AND project_id = $2', [
      templateId,
      projectId
    ]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`Template ${templateId} not found in project ${projectId}`);
    }
    await this.touchProject(projectId);
    return { deleted: true };
  }

  private async hydrateProject(row: ProjectRow): Promise<ProjectSummary> {
    const templates = await this.getTemplates(row.id);
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

  private async getTemplates(projectId: string): Promise<TemplateSummary[]> {
    const { rows } = await this.db.query<TemplateRow>(
      `SELECT id, project_id, name, version, status, updated_at
       FROM templates
       WHERE project_id = $1
       ORDER BY updated_at DESC`,
      [projectId]
    );

    return rows.map((row) => this.mapTemplate(row));
  }

  private async getTemplate(projectId: string, templateId: string): Promise<TemplateSummary> {
    const { rows } = await this.db.query<TemplateRow>(
      `SELECT id, project_id, name, version, status, updated_at
       FROM templates
       WHERE id = $1 AND project_id = $2`,
      [templateId, projectId]
    );

    const row = rows[0];
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

  private async ensureProjectExists(projectId: string) {
    const { rowCount } = await this.db.query('SELECT 1 FROM projects WHERE id = $1', [projectId]);
    if (rowCount === 0) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
  }

  private async touchProject(projectId: string) {
    const updatedAt = new Date().toISOString();
    await this.db.query('UPDATE projects SET updated_at = $1 WHERE id = $2', [updatedAt, projectId]);
  }
}
