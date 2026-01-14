import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { TodoInput } from "./components/TodoInput";
import { TodoList } from "./components/TodoList";

import { useState, useEffect } from "react";

function App() {
  const [todos, setTodos] = useState([
    { id: 1, input: "Hello! Add your first todo!", complete: true, category: "General" },
  ]);
  const [selectedTab, setSelectedTab] = useState("Open");

  // Lifted state for Input
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('todo-dark-mode');
    if (saved !== null) {
        return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })

  useEffect(() => {
    if (darkMode) {
        document.body.classList.add('dark-mode')
        document.body.classList.remove('light-mode')
    } else {
        document.body.classList.remove('dark-mode')
        document.body.classList.add('light-mode')
    }
    localStorage.setItem('todo-dark-mode', darkMode)
  }, [darkMode])

  function toggleDarkMode() {
      setDarkMode(curr => !curr)
  }

  function handleAddTodo(newTodo) {
    const newTodoList = [
      ...todos,
      {
        id: Date.now(), // Simple unique ID
        input: newTodo,
        complete: false,
        category: selectedCategory,
      },
    ];
    setTodos(newTodoList);
    handleSaveData(newTodoList);
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
    handleSaveData(newTodoList);
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
    handleSaveData(newTodoList);
  }
  
  function handleUpdateTodo(id, updatedFields) {
      const newTodoList = todos.map((todo) => {
          if (todo.id === id) {
              return { ...todo, ...updatedFields };
          }
          return todo;
      });
      setTodos(newTodoList);
      handleSaveData(newTodoList);
  }

  function handleReorderTodos(newOrder) {
      setTodos(newOrder);
      handleSaveData(newOrder);
  }

  function handleSaveData(currTodos) {
    localStorage.setItem("todo-app", JSON.stringify({ todos: currTodos }));
  }

  useEffect(() => {
    if (!localStorage || !localStorage.getItem("todo-app")) {
      return;
    }
    try {
      let db = JSON.parse(localStorage.getItem("todo-app"));
      // Simple migration check: if no IDs, clear or generate them. 
      // For simplicity/safety in this env, if data looks old, we might want to respect it but add IDs.
      // Let's just map old to new if needed, or default to db.todos
      const loadedTodos = db.todos.map(t => ({
          ...t,
          id: t.id || Math.random(), // Ensure ID exists
          category: t.category || "General"
      }));
      setTodos(loadedTodos);
    } catch (err) {
      console.error("Failed to parse todos", err);
    }
  }, []);

  return (
    <>
      <Header todos={todos} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
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
