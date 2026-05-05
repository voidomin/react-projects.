const TODO_STORAGE_KEY = "todo-app";

export function createTodoId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readTodos() {
  if (typeof localStorage === "undefined") {
    return [];
  }

  const storedValue = localStorage.getItem(TODO_STORAGE_KEY);
  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    const todos = Array.isArray(parsed?.todos) ? parsed.todos : [];

    return todos.map((todo, index) => ({
      id: todo.id ?? `${Date.now()}-${index}`,
      input: todo.input ?? "",
      complete: Boolean(todo.complete),
      category: todo.category ?? "General",
    }));
  } catch (error) {
    console.error("Failed to parse todos", error);
    return [];
  }
}

export function saveTodos(todos) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify({ todos }));
}
