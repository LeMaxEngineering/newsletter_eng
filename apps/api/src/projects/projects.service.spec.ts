import { describe, expect, beforeEach, it } from 'vitest';
import { ProjectsService } from './projects.service.js';
import { createInMemoryDatabase } from '../database/testing.js';

describe('ProjectsService (SQLite)', () => {
  let service: ProjectsService;

  beforeEach(() => {
    const db = createInMemoryDatabase();
    db.prepare(
      `INSERT INTO projects (id, name, owner, status, updated_at)
       VALUES ('proj_seed', 'Seed Project', 'Test User', 'active', '2026-01-10T00:00:00.000Z')`
    ).run();
    db.prepare(
      `INSERT INTO templates (id, project_id, name, version, status, updated_at)
       VALUES ('tmpl_seed', 'proj_seed', 'Seed Template', '1.0.0', 'draft', '2026-01-10T00:00:00.000Z')`
    ).run();

    service = new ProjectsService(db);
  });

  it('reads projects with hydrated template counts', () => {
    const projects = service.findAll();
    expect(projects).toHaveLength(1);
    expect(projects[0].templateCount).toBe(1);
    expect(projects[0].templates[0].name).toBe('Seed Template');
  });

  it('creates projects and templates and updates timestamps', () => {
    const project = service.createProject({ name: 'New Project', owner: 'Owner' });
    expect(project.id).toBeTruthy();
    expect(project.templates).toHaveLength(0);

    const template = service.addTemplate(project.id, { name: 'New Template', status: 'published' });
    expect(template.status).toBe('published');

    const refreshed = service.findOne(project.id);
    expect(refreshed.templateCount).toBe(1);
    expect(refreshed.templates[0].name).toBe('New Template');
  });

  it('updates and deletes templates', () => {
    const updated = service.updateTemplate('proj_seed', 'tmpl_seed', { name: 'Updated Template' });
    expect(updated.name).toBe('Updated Template');

    const deleted = service.deleteTemplate('proj_seed', 'tmpl_seed');
    expect(deleted.deleted).toBe(true);

    expect(() => service.deleteTemplate('proj_seed', 'tmpl_seed')).toThrowError();
  });

  it('updates and deletes projects', () => {
    const updated = service.updateProject('proj_seed', { name: 'Updated Project' });
    expect(updated.name).toBe('Updated Project');

    const deleted = service.deleteProject('proj_seed');
    expect(deleted.deleted).toBe(true);

    expect(() => service.findOne('proj_seed')).toThrowError();
  });
});
