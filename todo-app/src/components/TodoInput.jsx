import { useState } from "react";

export function TodoInput(props) {
  const {
    handleAddTodo,
    inputValue,
    setInputValue,
    selectedCategory,
    setSelectedCategory,
  } = props;

  return (
    <div className="input-container">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="category-select"
      >
        <option value="General">General</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
      </select>
      <input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        placeholder="Add task"
      />
      <button
        onClick={() => {
          if (!inputValue) {
            return;
          }
          handleAddTodo(inputValue);
        }}
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
}
