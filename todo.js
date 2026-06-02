"use strict";

const STORAGE_KEY = "todo-app.tasks.v1";

const appState = {
  tasks: loadTasks(),
  filter: "all",
};

const dom = {
  form: document.querySelector("#todo-form"),
  input: document.querySelector("#task-input"),
  list: document.querySelector("#todo-list"),
  count: document.querySelector("#todo-count"),
  emptyState: document.querySelector("#empty-state"),
  filterGroup: document.querySelector(".filter-group"),
};

render();

dom.form.addEventListener("submit", handleCreateTask);
dom.list.addEventListener("click", handleListClick);
dom.filterGroup.addEventListener("click", handleFilterClick);

function loadTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidTask);
  } catch (_error) {
    return [];
  }
}

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.tasks));
}

function isValidTask(task) {
  return (
    task &&
    typeof task.id === "string" &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean"
  );
}

function handleCreateTask(event) {
  event.preventDefault();

  const taskText = dom.input.value.trim();
  if (!taskText) {
    dom.input.focus();
    return;
  }

  appState.tasks.unshift({
    id: String(Date.now()) + String(Math.random()).slice(2, 7),
    text: taskText,
    completed: false,
  });

  saveTasks();
  dom.form.reset();
  render();
  dom.input.focus();
}

function handleListClick(event) {
  const target = event.target;
  const item = target.closest("li[data-task-id]");
  if (!item) {
    return;
  }

  const taskId = item.dataset.taskId;
  if (!taskId) {
    return;
  }

  if (target.matches("[data-action='toggle']")) {
    updateTask(taskId, (task) => ({ ...task, completed: !task.completed }));
    return;
  }

  if (target.matches("[data-action='edit']")) {
    const current = appState.tasks.find((task) => task.id === taskId);
    if (!current) {
      return;
    }

    const nextText = window.prompt("Edit your task:", current.text);
    if (nextText === null) {
      return;
    }

    const trimmedText = nextText.trim();
    if (!trimmedText) {
      return;
    }

    updateTask(taskId, (task) => ({ ...task, text: trimmedText }));
    return;
  }

  if (target.matches("[data-action='delete']")) {
    appState.tasks = appState.tasks.filter((task) => task.id !== taskId);
    saveTasks();
    render();
  }
}

function handleFilterClick(event) {
  const target = event.target;
  if (!target.matches(".filter-btn")) {
    return;
  }

  appState.filter = target.dataset.filter || "all";
  render();
}

function updateTask(taskId, updater) {
  appState.tasks = appState.tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    return updater(task);
  });

  saveTasks();
  render();
}

function getFilteredTasks() {
  if (appState.filter === "active") {
    return appState.tasks.filter((task) => !task.completed);
  }

  if (appState.filter === "completed") {
    return appState.tasks.filter((task) => task.completed);
  }

  return appState.tasks;
}

function render() {
  renderFilters();
  renderCount();
  renderList();
}

function renderFilters() {
  const filterButtons = dom.filterGroup.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === appState.filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCount() {
  const total = appState.tasks.length;
  const active = appState.tasks.filter((task) => !task.completed).length;
  dom.count.textContent =
    total === 0
      ? "0 tasks"
      : `${active} active / ${total} total ${total === 1 ? "task" : "tasks"}`;
}

function renderList() {
  const visibleTasks = getFilteredTasks();
  dom.list.innerHTML = "";

  if (visibleTasks.length === 0) {
    dom.emptyState.hidden = false;
    if (appState.tasks.length > 0) {
      dom.emptyState.textContent = "No tasks in this view. Try a different filter.";
    } else {
      dom.emptyState.textContent = "No tasks yet. Add your first task above.";
    }
    return;
  }

  dom.emptyState.hidden = true;

  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.taskId = task.id;

    li.innerHTML = `
      <button type="button" class="check-btn ${task.completed ? "is-done" : ""}" data-action="toggle" aria-label="Toggle completion">
        ${task.completed ? "Done" : "Mark"}
      </button>
      <p class="task-text ${task.completed ? "is-complete" : ""}">${escapeHtml(task.text)}</p>
      <div class="item-actions">
        <button type="button" data-action="edit">Edit</button>
        <button type="button" data-action="delete" class="danger">Delete</button>
      </div>
    `;

    dom.list.appendChild(li);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
