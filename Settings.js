import React from "react";
import { View, Text, Switch, StyleSheet, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./ThemeContext";

export default function Settings() {
    const { isDarkMode, toggleTheme } = useTheme();

    // Functie om AsyncStorage te legen
    const clearStorage = async () => {
        Alert.alert(
            "Opslag wissen?",
            "Weet je zeker dat je alle opgeslagen gegevens wilt verwijderen?",
            [
                { text: "Annuleren", style: "cancel" },
                { text: "Ja, wissen", onPress: async () => {
                        await AsyncStorage.clear();
                        Alert.alert("Opslag gewist", "Alle opgeslagen gegevens zijn verwijderd.");
                    }},
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#f5f5f5" : "#191919" }]}>
            <Text style={[styles.title, { color: isDarkMode ? "#333" : "#fff" }]}>
                Thema Instellingen
            </Text>

            <View style={styles.switchContainer}>
                <Text style={[styles.label, { color: isDarkMode ? "#555" : "#aaa" }]}>
                    Donkere modus
                </Text>
                <Switch
                    trackColor={{ false: "#81b0ff", true: "#767577" }}
                    thumbColor={isDarkMode ? "#f4f3f4" : "#f5dd4b"}
                    onValueChange={toggleTheme}
                    value={isDarkMode}
                />
            </View>

            {/* Clear Storage knop */}
            <View style={styles.clearButton}>
                <Button title="Clear Storage" color={isDarkMode ? "#d32f2f" : "#ff5252"} onPress={clearStorage} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: 200,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    label: {
        fontSize: 18,
    },
    clearButton: {
        marginTop: 20,
        width: 200,
    },
});
