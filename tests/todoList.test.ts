import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectsManager } from '../src/classes/ProjectsManager';
import { IProject } from '../src/classes/Project';

describe('To-Do list rendering', () => {
  const baseProject: IProject = {
    name: 'DemoProject',
    description: 'Test project',
    status: 'pending',
    userRole: 'architect',
    finishDate: new Date('2024-01-01')
  };

  let manager: ProjectsManager;

  beforeEach(() => {
    document.body.innerHTML = '<div id="projects-list"></div><div class="todo-list"></div>';
    const container = document.getElementById('projects-list') as HTMLElement;
    manager = new ProjectsManager(container);
  });

  it('shows todos in detail page', () => {
    const project = manager.newProject(baseProject);
    project.addTodo('Example task');
    manager.setDetailsPage(project);
    const items = document.querySelectorAll('.todo-list .todo-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Example task');
  });
});
