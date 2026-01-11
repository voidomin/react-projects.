import { useRef } from "react";
import { TodoCard } from "./TodoCard";

export function TodoList(props) {
  const { todos, selectedTab, handleReorderTodos } = props;

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const filterTodosList =
    selectedTab === "All"
      ? todos
      : selectedTab === "Completed"
      ? todos.filter((val) => val.complete)
      : todos.filter((val) => !val.complete);

  function handleSort() {
      // If we are filtering, reordering visually might be confusing if we commit it to the main list
      // which contains hidden items between these two. 
      // But let's support it by moving the dragged item to be *immediately before* the target item in the main list.
      
      const draggedId = dragItem.current;
      const targetId = dragOverItem.current;
      
      if (draggedId === targetId) return;

      const draggedIndex = todos.findIndex(t => t.id === draggedId);
      const targetIndex = todos.findIndex(t => t.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const newTodos = [...todos];
      const [draggedItemContent] = newTodos.splice(draggedIndex, 1);
      
      // If we moved down, the target index might have shifted if the dragged item was before it
      // But splice handles removal first.
      // Wait, if I remove 'draggedIndex', the 'targetIndex' might be wrong if 'draggedIndex' < 'targetIndex'.
      // Better to use a move helper or be careful.
      
      // Re-find target index after splice? 
      // If unique IDs, yes.
      let newTargetIndex = newTodos.findIndex(t => t.id === targetId);
      
      // If we are dropping downwards (target was below), we want to be *after* it? 
      // Or standard is "insert at this position".
      // If I drag over item X, I usually expect to drop *before* X or *after* X.
      // Simple insert at newTargetIndex.
      
      newTodos.splice(newTargetIndex, 0, draggedItemContent);
      
      handleReorderTodos(newTodos);
      
      dragItem.current = null;
      dragOverItem.current = null;
  }

  return (
    <>
      {filterTodosList.map((todo) => {
        return (
          <div
            key={todo.id}
            draggable
            onDragStart={(e) => (dragItem.current = todo.id)}
            onDragEnter={(e) => (dragOverItem.current = todo.id)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            style={{ cursor: 'move' }}
          >
            <TodoCard
                {...props}
                todo={todo}
            />
          </div>
        );
      })}
    </>
  );
}
