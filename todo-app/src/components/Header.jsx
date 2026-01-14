export function Header(props) {
  const { todos, darkMode, toggleDarkMode } = props;
  const todosLength = todos.length;
  const isTasksPlural = todos.length != 1;
  const taskOrTasks = isTasksPlural ? "tasks" : "task";

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h1 className="text-gradient">
        You have {todosLength} open {taskOrTasks}.
      </h1>
      <button onClick={toggleDarkMode} style={{ background: 'transparent', border: 'none', boxShadow: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
          <i className={darkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
      </button>
    </header>
  );
}
