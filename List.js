import {StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator, Dimensions} from 'react-native';
import {useEffect, useState} from "react";
import { FontAwesome } from "@expo/vector-icons"; // Zorg dat je @expo/vector-icons geïnstalleerd hebt
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from "./ThemeContext";
import {useNavigation} from "@react-navigation/native";



export default function List(){
    const navigation = useNavigation();

    const [bookStores, setBookStores] = useState([])
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(false);
    const [isFavorite, setIsFavorite] = useState([])
    const { isDarkMode } = useTheme();


    async function getBookStores() {
        const url = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,51.9225,4.4792)[\"shop\"=\"books\"];out;\n`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            setBookStores(json.elements);


            await AsyncStorage.setItem('bookStores', JSON.stringify(json.elements));
        } catch (error) {
            console.error(error.message);
             const storedBookStores = await AsyncStorage.getItem('bookStores');
            if (storedBookStores) {
                setBookStores(JSON.parse(storedBookStores));
            }
            }finally {
            setLoading(false)
        }
    }
    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            if (storedFavorites) {
                setIsFavorite(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Fout bij laden van favorieten:", error);
        }
    };

    useEffect(() => {
        loadFavorites();
        getBookStores()
    }, []);

    useEffect(() => {
        const saveFavorites = async () => {
            try {
                await AsyncStorage.setItem('favorites', JSON.stringify(isFavorite));
            } catch (error) {
                console.error("Fout bij opslaan van favorieten:", error);
            }
        };

        saveFavorites();
    }, [isFavorite]);
    const renderItem = ({ item }) => (
        <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('Map', { book: item })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.tags.name}</Text>
                <Pressable
                    onPress={() => setIsFavorite(prevFavorites =>
                        prevFavorites.includes(item.id)
                            ? prevFavorites.filter(fav => fav !== item.id)
                            : [...prevFavorites, item.id]
                    )}
                >
                    <FontAwesome
                        name={isFavorite.includes(item.id) ? "star" : "star-o"}
                        size={40}
                        color={isFavorite.includes(item.id) ? "#FFD700" : "#808080"}
                    />
                </Pressable>
            </View>
            <Text style={styles.author}>
                Adres: {`${item.tags["addr:street"]} ${item.tags["addr:housenumber"]} ${item.tags["addr:city"]}`}
            </Text>
        </Pressable>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? "#f5f5f5" : "#191919", // Omgewisseld
        },
        card: {
            width: Dimensions.get("window").width - 20,
            padding: 15,
            marginVertical: 8,
            marginHorizontal: 10,
            borderRadius: 10,
            backgroundColor: isDarkMode ? "#fff" : "#333", // Omgewisseld
            shadowColor: isDarkMode ? "#000" : "#fff", // Omgewisseld
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        title: {
            fontSize: 20,
            fontWeight: "bold",
            color: isDarkMode ? "#333" : "#fff", // Omgewisseld
        },
        author: {
            fontSize: 16,
            color: isDarkMode ? "#555" : "#aaa", // Omgewisseld
            marginTop: 5,
        },
        loaderContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: isDarkMode ? "#666" : "#ccc", // Omgewisseld
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },

    });
    return (

        <View style={styles.container}>
            {loading || bookStores > 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Laden...</Text>
                </View>
            ) : (
                <FlatList
                    data={bookStores}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                />
            )}
        </View>
    )
}

