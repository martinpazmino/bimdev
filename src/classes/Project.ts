import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "pending" | "active" | "finished"
export type UserRole = "architect" | "engineer" | "developer"
export type TodoStatus = "pending" | "done"

export interface ITodo {
  id: string
  text: string
  status: TodoStatus
}

export interface IProject {
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
}

export class Project implements IProject {
  name!: string
  description!: string
  status!: ProjectStatus
  userRole!: UserRole
  finishDate!: Date
  ui!: HTMLDivElement
  cost: number = 0
  progress: number = 0
  id: string
  todos: ITodo[] = []

  constructor(data: IProject) {
    this.name = data.name
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    this.finishDate = data.finishDate || new Date() // Default to current date if not provided
    this.id = uuidv4()
    this.setUI()
  }

  setUI() {
    if (this.ui) { return }
    const colors = ['#ca8134', '#029AE0', '#50B6E6', '#073044', '#415A66', '#017CB3']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    this.ui = document.createElement("div")
    this.ui.className = "project-card"
    this.ui.innerHTML = `
    <div class="card-header">
      <p class="project-icon" style="background-color: ${randomColor}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${this.name.slice(0, 2)}</p>
      <div>
        <h5>${this.name}</h5>
        <p>${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696;">Status</p>
        <p>${this.status}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Role</p>
        <p>${this.userRole}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Cost</p>
        <p>$${this.cost}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Estimated Progress</p>
        <p>${this.progress * 100}%</p>
      </div>
    </div>`
    this.ui.querySelector('.project-icon')?.addEventListener('click', () => this.showEditForm())
  }

  addTodo(text: string, status: TodoStatus = "pending"): ITodo {
    const todo = { id: uuidv4(), text, status }
    this.todos.push(todo)
    this.updateTodosUI()
    return todo
  }

  updateTodosUI() {
    const todosContainer = this.ui.querySelector('.todos-container')
    if (todosContainer) {
      todosContainer.innerHTML = this.todos.map(todo => `
        <div class="todo-item" data-todo-id="${todo.id}">
          <span>${todo.text}</span>
          <select class="todo-status" data-todo-id="${todo.id}">
            <option value="pending" ${todo.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="done" ${todo.status === "done" ? "selected" : ""}>Done</option>
          </select>
        </div>
      `).join('')
      this.ui.querySelectorAll('.todo-status').forEach(select => {
        select.addEventListener('change', (e) => {
          const todoId = (e.target as HTMLSelectElement).getAttribute('data-todo-id')
          const status = (e.target as HTMLSelectElement).value as TodoStatus
          const todo = this.todos.find(t => t.id === todoId)
          if (todo) todo.status = status
        })
      })
    }
  }

  showEditForm() {
    const dialog = document.createElement('dialog')
    dialog.innerHTML = `
      <form id="edit-project-form">
        <h2>Edit Project</h2>
        <div class="input-list">
          <div class="form-field-container">
            <label for="edit-name">Name</label>
            <input id="edit-name" name="edit-name" value="${this.name}">
          </div>
          <div class="form-field-container">
            <label for="edit-description">Description</label>
            <textarea id="edit-description" name="edit-description">${this.description}</textarea>
          </div>
          <div class="form-field-container">
            <label for="edit-status">Status</label>
            <select id="edit-status" name="edit-status">
              <option value="pending" ${this.status === "pending" ? "selected" : ""}>Pending</option>
              <option value="active" ${this.status === "active" ? "selected" : ""}>Active</option>
              <option value="finished" ${this.status === "finished" ? "selected" : ""}>Finished</option>
            </select>
          </div>
          <div class="form-field-container">
            <label for="edit-userRole">Role</label>
            <select id="edit-userRole" name="edit-userRole">
              <option value="architect" ${this.userRole === "architect" ? "selected" : ""}>Architect</option>
              <option value="engineer" ${this.userRole === "engineer" ? "selected" : ""}>Engineer</option>
              <option value="developer" ${this.userRole === "developer" ? "selected" : ""}>Developer</option>
            </select>
          </div>
          <div class="form-field-container">
            <label for="edit-finishDate">Finish Date</label>
            <input id="edit-finishDate" name="edit-finishDate" type="date" value="${this.finishDate.toISOString().split('T')[0]}">
          </div>
          <button type="submit">Save</button>
          <button type="button" class="cancel">Cancel</button>
        </div>
      </form>
    `
    document.body.appendChild(dialog)
    dialog.showModal()

    dialog.querySelector('form')?.addEventListener('submit', (e) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      this.name = formData.get('edit-name') as string
      this.description = formData.get('edit-description') as string
      this.status = formData.get('edit-status') as ProjectStatus
      this.userRole = formData.get('edit-userRole') as UserRole
      this.finishDate = new Date(formData.get('edit-finishDate') as string || new Date())
      this.updateUI()
      dialog.close()
      dialog.remove()
    })

    dialog.querySelector('.cancel')?.addEventListener('click', () => {
      dialog.close()
      dialog.remove()
    })
  }

  updateUI() {
    if (this.ui) {
      this.ui.innerHTML = `
        <div class="card-header">
          <p class="project-icon" style="background-color: ${this.ui.querySelector('.project-icon')?.getAttribute('style')?.match(/background-color: #\w+/)?.[0] || '#ca8134'}; padding: 10px; border-radius: 8px; aspect-ratio: 1;">${this.name.slice(0, 2)}</p>
          <div>
            <h5>${this.name}</h5>
            <p>${this.description}</p>
          </div>
        </div>
        <div class="card-content">
          <div class="card-property">
            <p style="color: #969696;">Status</p>
            <p>${this.status}</p>
          </div>
          <div class="card-property">
            <p style="color: #969696;">Role</p>
            <p>${this.userRole}</p>
          </div>
          <div class="card-property">
            <p style="color: #969696;">Cost</p>
            <p>$${this.cost}</p>
          </div>
          <div class="card-property">
            <p style="color: #969696;">Estimated Progress</p>
            <p>${this.progress * 100}%</p>
          </div>
        </div>
        <div class="todos-container"></div>
      `
      this.updateTodosUI()
    }
  }
}