import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [name, setName] = useState("Owner");

  useEffect(() => {
    const saved = localStorage.getItem("vocab_user_name");
    if (saved) setName(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("vocab_user_name", name);
  }, [name]);

  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
