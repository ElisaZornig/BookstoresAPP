import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            const jsonValue = await AsyncStorage.getItem("isEnabled");
            if (jsonValue !== null) {
                setIsDarkMode(JSON.parse(jsonValue));
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        await AsyncStorage.setItem("isEnabled", JSON.stringify(newValue));
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
