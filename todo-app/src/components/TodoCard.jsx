import { useState } from "react";

export function TodoCard(props) {
  const { todo, handleDeleteTodo, handleEditTodo, handleCompleteTodo, handleUpdateTodo } = props;
  const [subtaskInput, setSubtaskInput] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(false);

  const categoryColors = {
    General: "#e0e0e0",
    Work: "#ffb74d",
    Personal: "#4dd0e1",
  };

  return (
    <div className="card todo-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {todo.category && (
                <span 
                className="category-badge" 
                style={{ backgroundColor: categoryColors[todo.category] || "#e0e0e0" }}
                >
                {todo.category}
                </span>
            )}
            <p style={{ textDecoration: todo.complete ? 'line-through' : 'none' }}>{todo.input}</p>
        </div>
        <div className="todo-buttons">
            <button
            onClick={() => setShowSubtasks(val => !val)}
            >
             <i className={showSubtasks ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}></i>
            </button>
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

      {/* Subtasks Section */}
      {showSubtasks && (
      <div style={{ width: '100%', paddingLeft: '1rem' }}>
          {/* Progress Bar (Optional - simple text for now) */}
          {todo.subtasks && todo.subtasks.length > 0 && (
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                  {todo.subtasks.filter(st => st.complete).length}/{todo.subtasks.length} steps
              </div>
          )}

          {/* Subtask List */}
          {todo.subtasks && todo.subtasks.map(subtask => (
              <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <input 
                    type="checkbox" 
                    checked={subtask.complete} 
                    onChange={() => {
                        const newSubtasks = todo.subtasks.map(st => {
                            if (st.id === subtask.id) {
                                return { ...st, complete: !st.complete }
                            }
                            return st
                        })
                        handleUpdateTodo(todo.id, { subtasks: newSubtasks })
                    }}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  <span style={{ 
                      fontSize: '0.9rem', 
                      textDecoration: subtask.complete ? 'line-through' : 'none',
                      opacity: subtask.complete ? 0.6 : 1,
                      flex: 1
                  }}>
                      {subtask.content}
                  </span>
                  <button 
                    onClick={() => {
                        const newSubtasks = todo.subtasks.filter(st => st.id !== subtask.id);
                        handleUpdateTodo(todo.id, { subtasks: newSubtasks })
                    }}
                    style={{ background: 'transparent', border: 'none', padding: '0 5px', opacity: 0.5, fontSize: '0.8rem' }}
                  >
                      <i className="fa-solid fa-xmark"></i>
                  </button>
              </div>
          ))}

          {/* Add Subtask Input */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input 
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add step..."
                style={{ fontSize: '0.9rem', padding: '4px 8px' }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && subtaskInput) {
                        const newSubtask = {
                            id: Date.now(),
                            content: subtaskInput,
                            complete: false
                        }
                        const currentSubtasks = todo.subtasks || [];
                        handleUpdateTodo(todo.id, { subtasks: [...currentSubtasks, newSubtask] })
                        setSubtaskInput('')
                    }
                }}
              />
              <button 
                onClick={() => {
                    if (!subtaskInput) return;
                    const newSubtask = {
                        id: Date.now(),
                        content: subtaskInput,
                        complete: false
                    }
                    const currentSubtasks = todo.subtasks || [];
                    handleUpdateTodo(todo.id, { subtasks: [...currentSubtasks, newSubtask] })
                    setSubtaskInput('')
                }}
                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
              >
                  <i className="fa-solid fa-plus"></i>
              </button>
          </div>
      </div>
      )}
      {!showSubtasks && todo.subtasks && todo.subtasks.length > 0 && (
          <div 
            onClick={() => setShowSubtasks(true)}
            style={{ 
              fontSize: '0.8rem', 
              opacity: 0.7, 
              paddingLeft: '1rem', 
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px' 
            }}>
             <i className="fa-solid fa-list-check"></i>
             {todo.subtasks.filter(st => st.complete).length}/{todo.subtasks.length} steps (click to expand)
          </div>
      )}
    </div>
  );
}
