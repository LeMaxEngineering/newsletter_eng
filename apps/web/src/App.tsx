import { Link, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Panel, StatCard } from '@neewsletter/ui-kit';
import { blockCatalog } from '@neewsletter/block-schema';
import type { BlockCategory, BlockDefinition } from '@neewsletter/block-schema';
import {
  createProject as createProjectApi,
  createTemplate,
  deleteProject as deleteProjectApi,
  deleteTemplate as deleteTemplateApi,
  fetchProjects,
  updateProject as updateProjectApi,
  updateTemplate as updateTemplateApi
} from './api/projects.js';
import type { CreateProjectInput, CreateTemplateInput, ProjectSummary } from './types/projects.js';
import { fetchSession } from './api/auth.js';
import type { SessionPayload, UserRole } from './types/auth.js';
import { hasRequiredRole } from './utils/rbac.js';
import { addCanvasBlock, removeCanvasBlock, type CanvasBlock } from './utils/editorState.js';
import './styles.css';

interface NavItem {
  path: string;
  label: string;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/editor', label: 'Editor', roles: ['admin', 'editor'] },
  { path: '/analytics', label: 'Analytics', roles: ['admin', 'analyst'] }
];

const categoryLabels: Record<BlockCategory, string> = {
  structure: 'Structure blocks',
  content: 'Content blocks',
  interactive: 'Interactive blocks',
  commerce: 'Commerce blocks'
};

function useSessionQuery() {
  return useQuery<SessionPayload>({
    queryKey: ['session'],
    queryFn: fetchSession
  });
}

function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSessionQuery();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-pill">Beta</span>
          <div>
            <h1>Interactive Newsletter Engine</h1>
            <p className="muted">Design, personalize, and analyze interactive campaigns.</p>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const allowed = hasRequiredRole(session?.roles, item.roles);
            if (!allowed) {
              return (
                <span key={item.path} className="nav-link nav-link--disabled" title="Insufficient role">
                  {item.label}
                </span>
              );
            }

            return (
              <Link key={item.path} to={item.path} className="nav-link">
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="session-badge">
          {isLoading && <span>Loading session…</span>}
          {!isLoading && session ? (
            <>
              <span>{session.name}</span>
              <small>{session.roles.join(', ')}</small>
            </>
          ) : (
            !isLoading && <span>Session unavailable</span>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function ProjectsPanel() {
  const { data, isLoading, isError } = useQuery<ProjectSummary[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  let content: React.ReactNode;

  if (isLoading) {
    content = <p className="muted">Loading project data...</p>;
  } else if (isError) {
    content = (
      <p className="error-text">
        Unable to load projects. Ensure the API dev server is running on <code>http://localhost:4000</code>.
      </p>
    );
  } else if (!data || data.length === 0) {
    content = <p className="muted">No projects yet. Start by creating a workspace template in the editor.</p>;
  } else {
    content = (
      <ul className="project-list">
        {data.map((project) => (
          <li key={project.id} className="project-card">
            <div>
              <p className="muted">{project.owner}</p>
              <h3>{project.name}</h3>
            </div>
            <div className="project-meta">
              <span>{project.templateCount} template(s)</span>
              <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Panel title="Projects" description="Synced from the API service via React Query.">
      {content}
    </Panel>
  );
}

function DashboardView() {
  const stats = useMemo(
    () => [
      { label: 'Active Projects', value: '3', helperText: 'Editor + Rendering' },
      { label: 'Templates Published', value: '18', helperText: 'Across all tenants' },
      { label: 'Avg CTR Uplift', value: '+17%', helperText: 'vs. control campaigns' }
    ],
    []
  );

  return (
    <>
      <div className="dashboard-grid">
        <Panel title="Workspace health" description="Snapshot of core KPIs pulled from the analytics service.">
          <div className="card-grid">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </Panel>

        <Panel
          title="Next actions"
          description="Stay on track for Phase 1 delivery."
          actions={
            <button className="primary-btn" type="button">
              View roadmap
            </button>
          }
        >
          <ul className="task-list">
            <li>Wire editor shell to block schema package</li>
            <li>Set up Auth0 tenant + RBAC roles</li>
            <li>Expose projects/templates endpoints in the API</li>
          </ul>
        </Panel>
      </div>

      <ProjectsPanel />
    </>
  );
}

function BlockLibraryView({ onInsert }: { onInsert: (block: BlockDefinition) => void }) {
  const blocksByCategory = useMemo(() => {
    return blockCatalog.reduce<Record<BlockCategory, BlockDefinition[]>>((acc, block) => {
      acc[block.category] = acc[block.category] ?? [];
      acc[block.category].push(block);
      return acc;
    }, { structure: [], content: [], interactive: [], commerce: [] });
  }, []);

  return (
    <div className="block-library">
      {Object.entries(blocksByCategory).map(([category, blocks]) => (
        <Panel
          key={category}
          title={categoryLabels[category as BlockCategory]}
          description={`${blocks.length} available block${blocks.length === 1 ? '' : 's'}`}
        >
          <div className="block-grid">
            {blocks.map((block) => (
              <article key={`${block.kind}@${block.version}`} className="block-card">
                <div className="block-card-header">
                  <span className="block-icon" aria-hidden>
                    {block.meta.icon}
                  </span>
                  <div>
                    <h3>{block.meta.title}</h3>
                    <p>{block.meta.description}</p>
                  </div>
                </div>
                <div className="block-card-body">
                  <p className="muted">{block.fields.length} configurable field(s)</p>
                  <button className="secondary-btn" type="button" onClick={() => onInsert(block)}>
                    Insert block
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

function ProtectedRoute({ roles, children }: { roles?: UserRole[]; children: React.ReactNode }) {
  const { data: session, isLoading } = useSessionQuery();

  if (isLoading) {
    return (
      <Panel title="Checking permissions" description="Hold tight while we verify your workspace access.">
        <p className="muted">Loading session…</p>
      </Panel>
    );
  }

  if (!hasRequiredRole(session?.roles, roles)) {
    return (
      <Panel title="Access restricted" description="You lack the required role for this view.">
        <p className="muted">Ask an administrator to grant {roles?.join(' / ')} permissions.</p>
        <Link className="secondary-btn" to="/">
          Return to dashboard
        </Link>
      </Panel>
    );
  }

  return <>{children}</>;
}

function EditorView() {
  const queryClient = useQueryClient();
  const { data: session } = useSessionQuery();
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError
  } = useQuery<ProjectSummary[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects?.find((project) => project.id === selectedProjectId) ?? projects?.[0];
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);
  const [templateForm, setTemplateForm] = useState<CreateTemplateInput>({
    name: '',
    version: '1.0.0',
    status: 'draft'
  });
  const [projectForm, setProjectForm] = useState<CreateProjectInput>({
    name: '',
    owner: '',
    status: 'active'
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateRename, setTemplateRename] = useState<string>('');

  useEffect(() => {
    if (!selectedProject && projects?.length) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProject]);

  const canManageTemplates = session?.roles.some((role) => role === 'admin' || role === 'editor');
  const canManageProjects = canManageTemplates;
  const canDeleteProjects = session?.roles.includes('admin');
  const canDeleteTemplates = session?.roles.includes('admin');

  const templateMutation = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      if (!selectedProject) {
        throw new Error('No project selected');
      }

      return createTemplate(selectedProject.id, input, session?.roles);
    },
    onSuccess: () => {
      setTemplateForm({ name: '', version: '1.0.0', status: 'draft' });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const projectMutation = useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (editingProjectId) {
        return updateProjectApi(editingProjectId, input, session?.roles);
      }
      return createProjectApi(input, session?.roles);
    },
    onSuccess: (result) => {
      setProjectForm({ name: '', owner: '', status: 'active' });
      setEditingProjectId(null);
      if (!selectedProjectId) {
        setSelectedProjectId(result.id);
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => deleteProjectApi(projectId, session?.roles),
    onSuccess: () => {
      if (projects && projects.length > 1) {
        const fallback = projects.find((project) => project.id !== selectedProjectId);
        setSelectedProjectId(fallback?.id ?? null);
      } else {
        setSelectedProjectId(null);
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({
      templateId,
      payload
    }: {
      templateId: string;
      payload: Parameters<typeof updateTemplateApi>[2];
    }) => {
      if (!selectedProject) {
        throw new Error('No project selected');
      }
      return updateTemplateApi(selectedProject.id, templateId, payload, session?.roles);
    },
    onSuccess: () => {
      setEditingTemplateId(null);
      setTemplateRename('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!selectedProject) {
        throw new Error('No project selected');
      }
      return deleteTemplateApi(selectedProject.id, templateId, session?.roles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const handleInsertBlock = (block: BlockDefinition) => {
    setCanvasBlocks((prev) => addCanvasBlock(prev, block));
  };

  const handleRemoveBlock = (blockId: string) => {
    setCanvasBlocks((prev) => removeCanvasBlock(prev, blockId));
  };

  const handleSubmitTemplate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!templateForm.name.trim() || !selectedProject) {
      return;
    }
    templateMutation.mutate(templateForm);
  };

  const handleProjectSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectForm.name.trim() || !projectForm.owner.trim()) {
      return;
    }
    projectMutation.mutate(projectForm);
  };

  const handleEditProject = (project: ProjectSummary) => {
    setEditingProjectId(project.id);
    setProjectForm({
      name: project.name,
      owner: project.owner,
      status: project.status
    });
  };

  const handleCancelProjectEdit = () => {
    setEditingProjectId(null);
    setProjectForm({ name: '', owner: '', status: 'active' });
  };

  const beginTemplateRename = (templateId: string, currentName: string) => {
    setEditingTemplateId(templateId);
    setTemplateRename(currentName);
  };

  const templateList = selectedProject?.templates ?? [];

  return (
    <div className="editor-page">
      <div className="editor-layout">
        <Panel title="Editor canvas" description="Drag blocks from the library to compose the current template.">
          {canvasBlocks.length === 0 ? (
            <div className="canvas-placeholder">
              <p>Canvas placeholder</p>
              <small>Preview + personalization layers coming soon.</small>
            </div>
          ) : (
            <ul className="canvas-blocks">
              {canvasBlocks.map((item, index) => (
                <li key={item.id} className="canvas-block">
                  <div className="canvas-block-header">
                    <strong>
                      {index + 1}. {item.block.meta.title}
                    </strong>
                    <button type="button" className="ghost-btn" onClick={() => handleRemoveBlock(item.id)}>
                      Remove
                    </button>
                  </div>
                  <p className="muted">{item.block.meta.description}</p>
                  <div className="canvas-block-footer">
                    <span>{item.block.fields.length} field(s)</span>
                    <span>{item.block.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <BlockLibraryView onInsert={handleInsertBlock} />
      </div>

      <div className="template-manager">
        <Panel
          title="Project management"
          description="Create or update projects with admin/editor roles."
          actions={
            !canManageProjects && (
              <span className="muted" aria-live="polite">
                Project edits require admin/editor role.
              </span>
            )
          }
        >
          <div className="project-controls">
            <label className="project-select">
              <span>Active project</span>
              <select
                value={selectedProject?.id ?? ''}
                onChange={(event) => setSelectedProjectId(event.target.value || null)}
                disabled={projectsLoading || !projects?.length}
              >
                {!projects?.length && <option value="">No projects</option>}
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedProject && (
              <div className="project-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => handleEditProject(selectedProject)}
                  disabled={!canManageProjects}
                >
                  Edit project
                </button>
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() => selectedProject && deleteProjectMutation.mutate(selectedProject.id)}
                  disabled={!canDeleteProjects || deleteProjectMutation.isPending}
                >
                  {deleteProjectMutation.isPending ? 'Deleting…' : 'Delete project'}
                </button>
              </div>
            )}
          </div>

          <form className="project-form" onSubmit={handleProjectSubmit}>
            <label className="template-form-row">
              <span>Project name</span>
              <input
                type="text"
                value={projectForm.name}
                onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Summer Campaign"
                required
                disabled={!canManageProjects || projectMutation.isPending}
              />
            </label>
            <label className="template-form-row">
              <span>Owner</span>
              <input
                type="text"
                value={projectForm.owner}
                onChange={(event) => setProjectForm((prev) => ({ ...prev, owner: event.target.value }))}
                placeholder="Lifecycle team"
                required
                disabled={!canManageProjects || projectMutation.isPending}
              />
            </label>
            <label className="template-form-row">
              <span>Status</span>
              <select
                value={projectForm.status}
                onChange={(event) => setProjectForm((prev) => ({ ...prev, status: event.target.value as 'active' | 'archived' }))}
                disabled={!canManageProjects || projectMutation.isPending}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <div className="project-form-actions">
              {editingProjectId && (
                <button type="button" className="ghost-btn" onClick={handleCancelProjectEdit}>
                  Cancel edit
                </button>
              )}
              <button
                className="primary-btn"
                type="submit"
                disabled={!canManageProjects || projectMutation.isPending}
              >
                {projectMutation.isPending ? 'Saving…' : editingProjectId ? 'Update project' : 'Create project'}
              </button>
            </div>
            {projectMutation.isError && (
              <p className="error-text" aria-live="polite">
                Unable to save project. Verify API and permissions.
              </p>
            )}
            {projectMutation.isSuccess && (
              <p className="success-text" aria-live="polite">
                Project saved successfully.
              </p>
            )}
          </form>
        </Panel>

        <Panel
          title="Workspace templates"
          description={
            selectedProject
              ? `Viewing ${selectedProject.templateCount} template(s) from ${selectedProject.name}`
              : 'Select a project to manage templates'
          }
        >
          {projectsLoading && <p className="muted">Loading project templates…</p>}
          {projectsError && <p className="error-text">Unable to load projects. Check that the API is running.</p>}
          {!projectsLoading && !projectsError && !selectedProject && (
            <p className="muted">Create a project from the API to start managing templates.</p>
          )}
          {!projectsLoading && !projectsError && selectedProject && (
            <ul className="template-list">
              {templateList.map((template) => (
                <li key={template.id} className="template-card">
                  <div>
                    <p className="muted">{template.id}</p>
                    {editingTemplateId === template.id ? (
                      <div className="template-rename">
                        <input
                          type="text"
                          value={templateRename}
                          onChange={(event) => setTemplateRename(event.target.value)}
                          disabled={updateTemplateMutation.isPending}
                        />
                        <div className="template-rename-actions">
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => {
                              setEditingTemplateId(null);
                              setTemplateRename('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() =>
                              templateRename.trim() &&
                              updateTemplateMutation.mutate({
                                templateId: template.id,
                                payload: { name: templateRename }
                              })
                            }
                            disabled={!templateRename.trim() || updateTemplateMutation.isPending}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h3>{template.name}</h3>
                    )}
                  </div>
                  <div className="template-meta">
                    <span>{template.status}</span>
                    <span>v{template.version}</span>
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                    {canManageTemplates && (
                      <div className="template-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => beginTemplateRename(template.id, template.name)}
                          disabled={updateTemplateMutation.isPending}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() =>
                            updateTemplateMutation.mutate({
                              templateId: template.id,
                              payload: { status: template.status === 'draft' ? 'published' : 'draft' }
                            })
                          }
                          disabled={updateTemplateMutation.isPending}
                        >
                          {template.status === 'draft' ? 'Publish' : 'Mark draft'}
                        </button>
                        <button
                          type="button"
                          className="ghost-btn danger"
                          onClick={() => deleteTemplateMutation.mutate(template.id)}
                          disabled={!canDeleteTemplates || deleteTemplateMutation.isPending}
                        >
                          {deleteTemplateMutation.isPending ? 'Removing…' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Create template"
          description="Push a new template to the selected project (admin/editor roles only)."
          actions={
            !canManageTemplates && (
              <span className="muted" aria-live="polite">
                Session role lacks editor/admin access.
              </span>
            )
          }
        >
          <form className="template-form" onSubmit={handleSubmitTemplate}>
            <label className="template-form-row">
              <span>Template name</span>
              <input
                type="text"
                name="name"
                value={templateForm.name}
                onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="New interactive email"
                required
                disabled={!canManageTemplates || templateMutation.isPending || !selectedProject}
              />
            </label>
            <label className="template-form-row">
              <span>Version</span>
              <input
                type="text"
                name="version"
                value={templateForm.version ?? ''}
                onChange={(event) => setTemplateForm((prev) => ({ ...prev, version: event.target.value }))}
                placeholder="1.0.0"
                disabled={!canManageTemplates || templateMutation.isPending || !selectedProject}
              />
            </label>
            <label className="template-form-row">
              <span>Status</span>
              <select
                name="status"
                value={templateForm.status ?? 'draft'}
                onChange={(event) =>
                  setTemplateForm((prev) => ({ ...prev, status: event.target.value as 'draft' | 'published' }))
                }
                disabled={!canManageTemplates || templateMutation.isPending || !selectedProject}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <button
              className="primary-btn"
              type="submit"
              disabled={
                !canManageTemplates || !templateForm.name.trim() || templateMutation.isPending || !selectedProject
              }
            >
              {templateMutation.isPending ? 'Creating…' : 'Create template'}
            </button>
            {templateMutation.isError && (
              <p className="error-text" aria-live="polite">
                Unable to create template. Confirm API + roles header.
              </p>
            )}
            {templateMutation.isSuccess && (
              <p className="success-text" aria-live="polite">
                Template created successfully.
              </p>
            )}
          </form>
        </Panel>
      </div>
    </div>
  );
}

function AnalyticsPlaceholder() {
  return (
    <Panel title="Analytics" description="Per-block performance heatmaps, alerts, and automation triggers.">
      <p>Analytics visualizations will render here once the engagement pipeline is ready.</p>
    </Panel>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute roles={['admin', 'editor']}>
              <EditorView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles={['admin', 'analyst']}>
              <AnalyticsPlaceholder />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export { ProtectedRoute, EditorView };
