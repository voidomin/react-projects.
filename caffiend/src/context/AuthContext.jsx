import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useState, useEffect, useMemo, useCallback } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  updateDoc,
} from "firebase/firestore";
import { AuthContext } from "./auth";
import PropTypes from "prop-types";

function signupUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function AuthProvider(props) {
  const { children } = props;
  const [globalUser, setGlobalUser] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const signup = useCallback((email, password) => signupUser(email, password), []);

  const login = useCallback((email, password) => loginUser(email, password), []);

  const writeData = useCallback(async (data) => {
    if (!data || !Object.keys(data).length) {
      return;
    }
    try {
      const docRef = doc(db, "users", globalUser.uid);
      await setDoc(docRef, data, { merge: true });
    } catch (err) {
      console.log(err.message);
    }
  }, [globalUser]);

  const deleteData = useCallback(async (timestamp) => {
    if (!timestamp) {
      return;
    }
    try {
      const docRef = doc(db, "users", globalUser.uid);
      await updateDoc(docRef, {
        [timestamp]: deleteField(),
      });
      // Update local state to reflect change immediately
      const newData = { ...globalData };
      delete newData[timestamp];
      setGlobalData(newData);
    } catch (err) {
      console.log(err.message);
    }
  }, [globalUser, globalData]);

  const logout = useCallback(() => {
    setGlobalUser(null);
    setGlobalData(null);
    return signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      globalUser,
      globalData,
      setGlobalData,
      isLoading,
      signup,
      login,
      logout,
      writeData,
      deleteData,
    }),
    [globalUser, globalData, isLoading, signup, login, logout, writeData, deleteData],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("CURRENT USER: ", user);
      setGlobalUser(user);
      // if there's no user, empty the user state and return from this listener
      if (!user) {
        console.log("No active user");
        return;
      }

      // if there is a user, then check if the user has data in the database, and if they do, then fetch said data and update the global state

      try {
        setIsLoading(true);
        // first we create a reference for the document (labelled json object), and then we get the doc, and then we snapshot it to see if there's anything there
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        let firebaseData = {};
        if (docSnap.exists()) {
          firebaseData = docSnap.data();
          console.log("Found user data", firebaseData);
        }
        setGlobalData(firebaseData);
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
