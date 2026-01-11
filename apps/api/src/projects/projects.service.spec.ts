import { describe, expect, beforeEach, it } from 'vitest';
import { ProjectsService } from './projects.service.js';
import { createTestPool } from '../database/testing.js';

describe('ProjectsService (PostgreSQL via pg-mem)', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const pool = await createTestPool();
    await pool.query(
      `INSERT INTO projects (id, name, owner, status, updated_at)
       VALUES ('proj_seed', 'Seed Project', 'Test User', 'active', '2026-01-10T00:00:00.000Z')`
    );
    await pool.query(
      `INSERT INTO templates (id, project_id, name, version, status, updated_at)
       VALUES ('tmpl_seed', 'proj_seed', 'Seed Template', '1.0.0', 'draft', '2026-01-10T00:00:00.000Z')`
    );

    service = new ProjectsService(pool);
  });

  it('reads projects with hydrated template counts', async () => {
    const projects = await service.findAll();
    expect(projects).toHaveLength(1);
    expect(projects[0].templateCount).toBe(1);
    expect(projects[0].templates[0].name).toBe('Seed Template');
  });

  it('creates projects and templates and updates timestamps', async () => {
    const project = await service.createProject({ name: 'New Project', owner: 'Owner' });
    expect(project.id).toBeTruthy();
    expect(project.templates).toHaveLength(0);

    const template = await service.addTemplate(project.id, { name: 'New Template', status: 'published' });
    expect(template.status).toBe('published');

    const refreshed = await service.findOne(project.id);
    expect(refreshed.templateCount).toBe(1);
    expect(refreshed.templates[0].name).toBe('New Template');
  });

  it('updates and deletes templates', async () => {
    const updated = await service.updateTemplate('proj_seed', 'tmpl_seed', { name: 'Updated Template' });
    expect(updated.name).toBe('Updated Template');

    const deleted = await service.deleteTemplate('proj_seed', 'tmpl_seed');
    expect(deleted.deleted).toBe(true);

    await expect(service.deleteTemplate('proj_seed', 'tmpl_seed')).rejects.toThrowError();
  });

  it('updates and deletes projects', async () => {
    const updated = await service.updateProject('proj_seed', { name: 'Updated Project' });
    expect(updated.name).toBe('Updated Project');

    const deleted = await service.deleteProject('proj_seed');
    expect(deleted.deleted).toBe(true);

    await expect(service.findOne('proj_seed')).rejects.toThrowError();
  });
});
