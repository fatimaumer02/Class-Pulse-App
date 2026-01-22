import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(firestore, 'users', user.uid));
      if (snap.exists()) {
        setIsDarkMode(snap.data()?.darkMode ?? false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async (value: boolean) => {
    setIsDarkMode(value);
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(firestore, 'users', user.uid),
        { darkMode: value },
        { merge: true }
      );
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
