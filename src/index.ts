import { IProject, ProjectStatus, UserRole } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"

function isProjectStatus(value: FormDataEntryValue | null): value is ProjectStatus {
  return value === "pending" || value === "active" || value === "finished"
}

function isUserRole(value: FormDataEntryValue | null): value is UserRole {
  return value === "architect" || value === "engineer" || value === "developer"
}

function showModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

// New Project Button
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => { showModal("new-project-modal") })
} else {
  console.warn("New projects button was not found")
}

// Project Form Submission
const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    const status = formData.get("status")
    const role = formData.get("userRole")
    if (!isProjectStatus(status) || !isUserRole(role)) {
      alert("Invalid role or status")
      return
    }
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status,
      userRole: role,
      finishDate: new Date(formData.get("finishDate") as string || new Date().toISOString().split('T')[0])
    }
    try {
      const project = projectsManager.newProject(projectData)
      console.log(project)
      projectForm.reset()
      closeModal("new-project-modal")
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred")
    }
  })
} else {
  console.warn("The project form was not found. Check the ID!")
}

// Export Button
const exportProjectsBtn = document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

// Import Button
const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

// Add Todo Button
const addTodoBtn = document.getElementById("add-todo-btn")
if (addTodoBtn) {
  addTodoBtn.addEventListener("click", () => {
    const project = projectsManager.list[0] // Example: use first project, adjust logic as needed
    if (project) {
      const todoText = prompt("Enter ToDo text:")
      if (todoText) project.addTodo(todoText)
    }
  })
}