import { Project, IProject, TodoStatus, ITodo } from "./Project";

export class ProjectsManager {
  list: Project[] = [];
  private ui: HTMLElement;
  private selectedProjectId: string | null = null;

  constructor(container: HTMLElement) {
    this.ui = container;
  }

  newProject(data: IProject): Project {
    if (data.name.length < 5) {
      throw new Error("Project name must be at least 5 characters long");
    }
    const projectNames = this.list.map(project => project.name);

    if (projectNames.includes(data.name)) {
      throw new Error(`A project with the name "${data.name}" already exists`);
    }

    const project = new Project(data);

    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page");
      const detailsPage = document.getElementById("project-details");
      if (!projectsPage || !detailsPage) return;

      projectsPage.style.display = "none";
      detailsPage.style.display = "flex";
      this.selectedProjectId = project.id;
      this.setDetailsPage(project);
    });

    this.ui.append(project.ui);
    this.list.push(project);

    return project;
  }

  private setDetailsPage(project: Project): void {
    const cardTitle = document.querySelector("[data-project-info='cardTitle']") as HTMLElement;
    const cardDescription = document.querySelector("[data-project-info='cardDescription']") as HTMLElement;
    const cardStatus = document.querySelector("[data-project-info='cardStatus']") as HTMLElement;
    const cardRole = document.querySelector("[data-project-info='cardRole']") as HTMLElement;
    const cardCost = document.querySelector("[data-project-info='cardCost']") as HTMLElement;
    const cardProgress = document.querySelector("[data-project-info='cardProgress']") as HTMLElement;
    const todosContainer = document.querySelector(".todos-container") as HTMLElement;

    if (cardTitle) cardTitle.textContent = project.name;
    if (cardDescription) cardDescription.textContent = project.description;
    if (cardStatus) cardStatus.textContent = project.status;
    if (cardRole) cardRole.textContent = project.userRole;
    if (cardCost) cardCost.textContent = `$${project.cost}`;
    if (cardProgress) cardProgress.textContent = `${project.progress * 100}%`;
    if (todosContainer) {
      todosContainer.innerHTML = project.todos.map(todo => `
        <div class="todo-item" data-todo-id="${todo.id}">
          <span>${todo.text}</span>
          <select class="todo-status" data-todo-id="${todo.id}">
            <option value="pending" ${todo.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="done" ${todo.status === "done" ? "selected" : ""}>Done</option>
          </select>
        </div>
      `).join('');
      todosContainer.querySelectorAll('.todo-status').forEach(select => {
        select.addEventListener('change', (e) => {
          const todoId = (e.target as HTMLSelectElement).getAttribute('data-todo-id');
          const status = (e.target as HTMLSelectElement).value as TodoStatus;
          const todo = project.todos.find(t => t.id === todoId);
          if (todo) todo.status = status;
        });
      });
    }
  }

  deleteProject(id: string): void {
    const project = this.getProject(id);
    if (!project) return;
    project.ui.remove();
    this.list = this.list.filter(p => p.id !== id);
  }

  getSelectedProject(): Project | undefined {
    if (!this.selectedProjectId) return undefined;
    return this.getProject(this.selectedProjectId);
  }

  getProject(id: string): Project | undefined {
    return this.list.find((project: Project) => project.id === id);
  }

  exportToJSON(): void {
    const data = JSON.stringify(
      this.list.map(project => ({
        name: project.name,
        description: project.description,
        status: project.status,
        userRole: project.userRole,
        finishDate: project.finishDate.toISOString(),
        cost: project.cost,
        progress: project.progress,
        todos: project.todos
      })),
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  importFromJSON(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            data.forEach((item: Omit<IProject, "finishDate"> & { finishDate: string; todos?: ITodo[]; cost?: number; progress?: number }) => {
              const finishDate = new Date(item.finishDate);
              if (isNaN(finishDate.getTime())) {
                throw new Error(`Invalid date format for project "${item.name}"`);
              }
              const projectData: IProject & { todos?: ITodo[]; cost?: number; progress?: number } = {
                ...item,
                finishDate,
                todos: item.todos || [],
                cost: item.cost || 0,
                progress: item.progress || 0
              };
              const existingProject = this.getProjectByName(item.name);
              if (existingProject) {
                existingProject.name = item.name;
                existingProject.description = item.description;
                existingProject.status = item.status;
                existingProject.userRole = item.userRole;
                existingProject.finishDate = finishDate;
                existingProject.cost = item.cost || 0;
                existingProject.progress = item.progress || 0;
                existingProject.todos = item.todos || [];
                existingProject.updateUI();
              } else {
                this.newProject(projectData);
              }
            });
          } catch (err) {
            alert(`Error importing projects: ${err instanceof Error ? err.message : "Invalid JSON format"}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  private getProjectByName(name: string): Project | undefined {
    return this.list.find(project => project.name === name);
  }
}