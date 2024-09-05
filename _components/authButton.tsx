"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/firebase"; 
import styles from "@/components/Game.module.css"

const provider = new GoogleAuthProvider();

const AuthButton: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      {user ? (
        <div className={styles.profile}>
          <p>Welcome, {user.displayName || "User"}!</p>
          <button onClick={handleLogout} className={styles.logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin} className={styles.login}>Login with Google</button>
      )}
    </div>
  );
};

export default AuthButton;
