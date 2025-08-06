import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectsManager } from '../src/classes/ProjectsManager';
import { IProject } from '../src/classes/Project';

vi.stubGlobal('alert', vi.fn());

describe('ProjectsManager', () => {
  const baseProject: IProject = {
    name: 'House',
    description: 'Build house',
    status: 'pending',
    userRole: 'architect',
    finishDate: new Date('2025-01-01')
  };

  let container: HTMLElement;
  let manager: ProjectsManager;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    manager = new ProjectsManager(container);
  });

  it('creates a new project', () => {
    const project = manager.newProject(baseProject);
    expect(manager.list).toHaveLength(1);
    expect(manager.list[0]).toBe(project);
    expect(container.children.length).toBe(1);
  });

  it('throws when project name already exists', () => {
    manager.newProject(baseProject);
    expect(() => manager.newProject(baseProject)).toThrow();
  });

  it('deletes a project', () => {
    const project = manager.newProject(baseProject);
    manager.deleteProject(project.id);
    expect(manager.list).toHaveLength(0);
    expect(container.children.length).toBe(0);
  });

  it('imports projects from JSON', () => {
    const json = JSON.stringify([
      {
        ...baseProject,
        finishDate: baseProject.finishDate.toISOString()
      }
    ]);
    const file = new File([json], 'projects.json', { type: 'application/json' });

    class MockFileReader {
      public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      readAsText(_: Blob) {
        this.onload?.({ target: { result: json } } as any);
      }
    }

    vi.stubGlobal('FileReader', MockFileReader as any);

    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function (this: HTMLInputElement) {
        this.onchange?.({ target: { files: [file] } } as any);
      });

    manager.importFromJSON();

    expect(manager.list).toHaveLength(1);
    expect(manager.list[0].name).toBe('House');

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});

