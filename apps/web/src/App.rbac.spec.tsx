import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute, EditorView } from './App';
import type { SessionPayload } from './types/auth';
import type { ProjectSummary } from './types/projects';

interface RenderOptions {
  session?: SessionPayload;
  projects?: ProjectSummary[];
}

function createSessionFixture(overrides?: Partial<SessionPayload>): SessionPayload {
  return {
    userId: 'user_test',
    name: 'Test User',
    email: 'test@example.com',
    tenantId: 'tenant_test',
    roles: ['analyst'],
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    ...overrides
  };
}

function createProjectFixture(): ProjectSummary[] {
  return [
    {
      id: 'proj_test',
      name: 'Test Project',
      owner: 'QA',
      status: 'active',
      templateCount: 1,
      updatedAt: new Date().toISOString(),
      templates: [
        {
          id: 'tmpl_1',
          name: 'Hero',
          version: '1.0.0',
          status: 'draft',
          updatedAt: new Date().toISOString()
        }
      ]
    }
  ];
}

function renderWithProviders(ui: React.ReactElement, options: RenderOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  if (options.session) {
    queryClient.setQueryData(['session'], options.session);
  }

  if (options.projects) {
    queryClient.setQueryData(['projects'], options.projects);
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/editor']}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RBAC UI behaviors', () => {
  it('blocks access when user lacks required role', () => {
    renderWithProviders(
      <ProtectedRoute roles={['admin']}>
        <div>Secret content</div>
      </ProtectedRoute>,
      {
        session: createSessionFixture({ roles: ['analyst'] })
      }
    );

    expect(screen.getByText(/Access restricted/i)).toBeInTheDocument();
    expect(screen.queryByText(/Secret content/i)).not.toBeInTheDocument();
  });

  it('renders children when role requirement is satisfied', () => {
    renderWithProviders(
      <ProtectedRoute roles={['admin']}>
        <div>Secret content</div>
      </ProtectedRoute>,
      {
        session: createSessionFixture({ roles: ['admin'] })
      }
    );

    expect(screen.getByText(/Secret content/i)).toBeInTheDocument();
  });

  it('shows template form restriction for non editor/admin roles', () => {
    renderWithProviders(<EditorView />, {
      session: createSessionFixture({ roles: ['analyst'] }),
      projects: createProjectFixture()
    });

    expect(screen.getByText(/Session role lacks editor\/admin access/i)).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /create template/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables template creation for admin role', async () => {
    renderWithProviders(<EditorView />, {
      session: createSessionFixture({ roles: ['admin'] }),
      projects: createProjectFixture()
    });

    expect(screen.queryByText(/Session role lacks editor\/admin access/i)).not.toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Template name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Template' } });
    const submitButton = screen.getByRole('button', { name: /create template/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it('restricts project management inputs for non editor/admin roles', () => {
    renderWithProviders(<EditorView />, {
      session: createSessionFixture({ roles: ['analyst'] }),
      projects: createProjectFixture()
    });

    expect(screen.getByText(/Project edits require admin\/editor role/i)).toBeInTheDocument();
    const projectNameInput = screen.getByLabelText(/Project name/i) as HTMLInputElement;
    expect(projectNameInput).toBeDisabled();
  });

  it('shows template actions for admin role', () => {
    renderWithProviders(<EditorView />, {
      session: createSessionFixture({ roles: ['admin'] }),
      projects: createProjectFixture()
    });

    const renameButton = screen.getByRole('button', { name: /rename/i });
    expect(renameButton).toBeInTheDocument();
    fireEvent.click(renameButton);
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });
});
