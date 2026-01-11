import type {
  ProjectSummary,
  CreateTemplateInput,
  UpdateTemplateInput,
  CreateProjectInput,
  UpdateProjectInput
} from '../types/projects.js';
import type { UserRole } from '../types/auth.js';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

function buildHeaders(roles?: UserRole[]) {
  return {
    'Content-Type': 'application/json',
    ...(roles?.length ? { 'x-user-roles': roles.join(',') } : {})
  };
}

async function handleResponse<T>(response: Response) {
  if (!response.ok) {
    throw new Error(`Failed to load projects (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const response = await fetch(`${API_BASE}/projects`);
  return handleResponse(response);
}

export async function createProject(payload: CreateProjectInput, roles?: UserRole[]) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: buildHeaders(roles),
    body: JSON.stringify(payload)
  });
  return handleResponse<ProjectSummary>(response);
}

export async function updateProject(projectId: string, payload: UpdateProjectInput, roles?: UserRole[]) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: buildHeaders(roles),
    body: JSON.stringify(payload)
  });
  return handleResponse<ProjectSummary>(response);
}

export async function deleteProject(projectId: string, roles?: UserRole[]) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    headers: buildHeaders(roles)
  });
  return handleResponse<{ deleted: boolean }>(response);
}

export async function createTemplate(
  projectId: string,
  payload: CreateTemplateInput,
  roles?: UserRole[]
) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/templates`, {
    method: 'POST',
    headers: buildHeaders(roles),
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

export async function updateTemplate(
  projectId: string,
  templateId: string,
  payload: UpdateTemplateInput,
  roles?: UserRole[]
) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/templates/${templateId}`, {
    method: 'PATCH',
    headers: buildHeaders(roles),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteTemplate(projectId: string, templateId: string, roles?: UserRole[]) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/templates/${templateId}`, {
    method: 'DELETE',
    headers: buildHeaders(roles)
  });
  return handleResponse<{ deleted: boolean }>(response);
}
