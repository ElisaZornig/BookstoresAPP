import * as React from 'react';
import { View, Text, SafeAreaView, Modal, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './ThemeContext';
import Map from './Map';
import List from './List';
import Settings from './Settings';
import * as LocalAuthentication from 'expo-local-authentication';
import {useEffect} from "react";


const Tab = createMaterialTopTabNavigator();

function MainApp() {
    async function authenticate() {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const supportedAuthTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (!hasHardware || !supportedAuthTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            alert("Face ID wordt niet ondersteund op dit apparaat.");
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Scan je gezicht om verder te gaan",
            fallbackLabel: "Gebruik toegangscode",
            disableDeviceFallback: false,
        });

        if (result.success) {
            alert("Authenticatie geslaagd!");
        } else {
            alert("Authenticatie mislukt!");
        }
    }



    const { isDarkMode } = useTheme();
    const [showModal, setShowModal] = React.useState(false);

    useEffect(() => {
        async function checkFirstTime() {
            const isFirstTime = await AsyncStorage.getItem('isFirstTime');
            if (isFirstTime === null) {
                setShowModal(true);
                await AsyncStorage.setItem('isFirstTime', 'false');
            }
        }
        checkFirstTime();
        authenticate();

    }, []);

    // Thema kleuren
    const theme = {
        background: isDarkMode ? 'white' : '#121212',
        text: isDarkMode ? 'black' : 'white',
        tabBar: isDarkMode ? 'white' : '#1f1f1f',
        statusBarStyle: isDarkMode ? 'dark' : 'light',
    };

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                    <View style={{ flex: 1 }}>
                        <Tab.Navigator
                            screenOptions={{
                                tabBarStyle: { backgroundColor: theme.tabBar },
                                tabBarLabelStyle: { color: theme.text },
                            }}
                        >
                            <Tab.Screen name="Map" component={Map} />
                            <Tab.Screen name="List" component={List} />
                            <Tab.Screen name="Settings" component={Settings} />
                        </Tab.Navigator>
                    </View>
                </SafeAreaView>
                <StatusBar style={theme.statusBarStyle} />

                {/* Pop-up bij eerste keer opstarten */}
                <Modal visible={showModal} animationType="fade" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#fff' : '#333' }]}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#000' : '#fff' }]}>
                                Welkom bij de Boekenwinkel App!
                            </Text>
                            <Text style={[styles.modalText, { color: isDarkMode ? '#444' : '#ddd' }]}>
                                Hier kun je boekenwinkels vinden en ze als favoriet markeren. Je kunt ook wisselen tussen
                                de donkere en lichte modus in de instellingen.
                            </Text>
                            <Button title="Begrepen!" onPress={() => setShowModal(false)} color={isDarkMode ? '#007AFF' : '#FFA500'} />
                        </View>
                    </View>
                </Modal>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <MainApp />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
    },
});
