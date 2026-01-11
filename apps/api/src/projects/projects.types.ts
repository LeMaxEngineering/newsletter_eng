export interface TemplateSummary {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'archived';
  templateCount: number;
  updatedAt: string;
  templates: TemplateSummary[];
}

export interface CreateTemplateInput {
  name: string;
  version?: string;
  status?: 'draft' | 'published';
}

export interface UpdateTemplateInput {
  name?: string;
  version?: string;
  status?: 'draft' | 'published';
}

export interface CreateProjectInput {
  name: string;
  owner: string;
  status?: 'active' | 'archived';
}

export interface UpdateProjectInput {
  name?: string;
  owner?: string;
  status?: 'active' | 'archived';
}
