import React, {useState, useEffect, useRef} from 'react';
import MapView, {Marker, Callout, Polyline} from 'react-native-maps';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import * as Location from 'expo-location';
import {useLinkProps, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./ThemeContext";
import { Overlay } from 'react-native-elements';  // Zorg ervoor dat je de juiste Overlay component importeert
import MapViewDirections from 'react-native-maps-directions';





export default function Map() {
    const [region, setRegion] = useState(null);
    const [detailBook, setDetailBook] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const [bookStores, setBookStores] = useState([])
    const { isDarkMode } = useTheme();
    const route = useRoute()
    const [currentBook, setBook] = useState(null)
    const [toggleDetail, setToggleDetail] = useState(false)
    const markerRefs = useRef([]);
    const [location, setLocation]= useState(null)



    useEffect(() => {
            if (route.params?.book) {
                const newLocation = {
                    latitude: route.params.book.lat,
                    longitude: route.params.book.lon,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                };
                setDetailBook(newLocation)
                setBook(route.params.book)
                setToggleDetail(true)
            }
        if (route.params?.book) {
            const targetIndex = markers.findIndex(marker =>
                marker.latitude === route.params.book.lat &&
                marker.longitude === route.params.book.lon
            );

            if (targetIndex !== -1 && markerRefs.current[targetIndex]) {
                markerRefs.current[targetIndex].showCallout();
            }
        }
        }, [route.params?.book]);

    useEffect(() => {
        async function getCurrentLocation() {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation)
            const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
            };
            setRegion(newLocation)
        }

        getCurrentLocation();
        getBookStores();
        bookStores.forEach((book, index) => {
            const newBookStore = {
                latitude: book.lat,
                longitude: book.lon,
                name: book.tags.name,
                city: book.tags["addr:city"],
                street: book.tags["addr:street"],
                houseNumber: book.tags["addr:housenumber"],
                website: book.tags.website
            };
            setMarkers((prevMarkers) => [...prevMarkers, newBookStore]); // Nieuwe marker toevoegen
        });
        // console.log("hoi")

    }, [bookStores]);
    useEffect(() => {

    }, []);

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

        } catch (error) {
            console.error(error.message);
        }
    }


    return (
        <View style={styles.container}>
            {region ? (
                <MapView
                    style={styles.map}
                    region={detailBook ? detailBook : region}
                    showsUserLocation={true}
                    showsCompass={true}
                    userInterfaceStyle={isDarkMode ? "light" : "dark"}
                >
                    {markers.map((marker, index) => (
                        <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} ref={el => markerRefs.current[index] = el}  // Hier slaan we de ref op
                        >
                            <Callout>
                                <Text>{marker.name}</Text>
                                <Text>{`Adres: ${marker.city} ${marker.street} ${marker.houseNumber}` }</Text>
                                <Text>{marker.website }</Text>
                            </Callout>
                        </Marker>
                    ))}
                    {toggleDetail ? (
                        <MapViewDirections
                        origin={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        }}
                        destination={{
                            latitude: detailBook.latitude,
                            longitude: detailBook.longitude,
                        }}
                        apikey={"AIzaSyAt2Wu7GLK8i-RuBSvW00w_qru9BrDd4tk"}
                        strokeWidth={3}
                        strokeColor="hotpink"
                        />
                    ): null}
                </MapView>

            ) : (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{errorMsg || 'Locatie ophalen...'}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
});