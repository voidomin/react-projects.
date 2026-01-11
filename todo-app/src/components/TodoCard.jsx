export function TodoCard(props) {
  const { todo, handleDeleteTodo, handleEditTodo, handleCompleteTodo } = props;

  const categoryColors = {
    General: "#e0e0e0",
    Work: "#ffb74d",
    Personal: "#4dd0e1",
  };

  return (
    <div className="card todo-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {todo.category && (
            <span 
              className="category-badge" 
              style={{ backgroundColor: categoryColors[todo.category] || "#e0e0e0" }}
            >
              {todo.category}
            </span>
        )}
        <p>{todo.input}</p>
      </div>
      <div className="todo-buttons">
        <button
          onClick={() => {
            handleCompleteTodo(todo.id);
          }}
          disabled={todo.complete}
        >
          <h6>Done</h6>
        </button>
         <button
          onClick={() => {
            handleEditTodo(todo.id);
          }}
        >
          <h6>Edit</h6>
        </button>
        <button
          onClick={() => {
            handleDeleteTodo(todo.id);
          }}
        >
          <h6>Delete</h6>
        </button>
      </div>
    </div>
  );
}
