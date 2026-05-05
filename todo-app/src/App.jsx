import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { TodoInput } from "./components/TodoInput";
import { TodoList } from "./components/TodoList";
import { createTodoId, readTodos, saveTodos } from "./utils/todoStorage";

import { useState, useEffect } from "react";

const initialTodos = [
  {
    id: 1,
    input: "Hello! Add your first todo!",
    complete: true,
    category: "General",
  },
];

function App() {
  const [todos, setTodos] = useState(() => {
    const storedTodos = readTodos();
    return storedTodos.length > 0 ? storedTodos : initialTodos;
  });
  const [selectedTab, setSelectedTab] = useState("Open");

  // Lifted state for Input
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("todo-dark-mode");
    if (saved !== null) {
      return saved === "true";
    }
    return typeof globalThis.matchMedia === "function"
      ? globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
    localStorage.setItem("todo-dark-mode", darkMode);
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode((curr) => !curr);
  }

  function handleAddTodo(newTodo) {
    const newTodoList = [
      ...todos,
      {
        id: createTodoId(),
        input: newTodo,
        complete: false,
        category: selectedCategory,
      },
    ];
    setTodos(newTodoList);
    saveTodos(newTodoList);
    setInputValue(""); // Clear input after adding
  }

  function handleCompleteTodo(id) {
    const newTodoList = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, complete: true };
      }
      return todo;
    });
    setTodos(newTodoList);
    saveTodos(newTodoList);
  }

  function handleEditTodo(id) {
    const todoToEdit = todos.find((todo) => todo.id === id);
    if (!todoToEdit) return;

    setInputValue(todoToEdit.input);
    setSelectedCategory(todoToEdit.category || "General");
    handleDeleteTodo(id); // Remove from list to "move" to input
  }

  function handleDeleteTodo(id) {
    const newTodoList = todos.filter((todo) => todo.id !== id);
    setTodos(newTodoList);
    saveTodos(newTodoList);
  }

  function handleUpdateTodo(id, updatedFields) {
    const newTodoList = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, ...updatedFields };
      }
      return todo;
    });
    setTodos(newTodoList);
    saveTodos(newTodoList);
  }

  function handleReorderTodos(newOrder) {
    setTodos(newOrder);
    saveTodos(newOrder);
  }

  return (
    <>
      <Header
        todos={todos}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Tabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        todos={todos}
      />
      <TodoList
        handleCompleteTodo={handleCompleteTodo}
        handleDeleteTodo={handleDeleteTodo}
        handleEditTodo={handleEditTodo}
        handleReorderTodos={handleReorderTodos}
        handleUpdateTodo={handleUpdateTodo}
        selectedTab={selectedTab}
        todos={todos}
      />
      <TodoInput
        handleAddTodo={handleAddTodo}
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </>
  );
}

export default App;
