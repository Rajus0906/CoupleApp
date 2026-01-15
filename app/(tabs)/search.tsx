import React from 'react';
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

//Dummy Data (For Now)
const NEWS_ITEM = [
    {
        id: '1',
        title: 'GTA VI Trailer Leaked?',
        source: 'IGN - 1h ago',
        image: 'https://gaming-cdn.com/images/products/2462/orig/grand-theft-auto-vi-pc-rockstar-cover.jpg?v=1762511430', // Gaming Image
        tag: 'BREAKING'
    },
    {
        id: '2',
        title: 'Avengers Doomsday?',
        source: 'IGN - 5h ago',
        image: 'https://cdn.marvel.com/content/2x/avengersdoomsday_lob_mas_mob_02.jpg', // Movie Image
        tag: 'BREAKING'
    },
    {
        id: '3',
        title: 'Cyberpunk Update Fixes Game',
        source: 'IGN - 10h ago',
        image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/644eb087007768417a847e52c38eeaf34b57fd12/page_bg_raw.jpg?t=1768304190', // Cyberpunk Image
        tag: 'UPDATE'
    }
];

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'Games'];

export default function SearchScreen() {
    const [activeCategory, setActiveCategory] = React.useState('All');
    const [searchText, setSearchText] = React.useState('');

    return (
        <View style={styles.container} >

            {/* Header Section*/}
            <View style={styles.headerContainer}>
                {/* Search Bar Section*/}
                <View style={styles.searchBar}>
                    <Ionicons name='search' size={20} color='#8d6e63' style={{ marginRight: 10}}/>
                    <TextInput
                        placeholder='Search'
                        placeholderTextColor='#8d6e63'
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* Filter Pills Section*/}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pillsList}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            style={[
                                styles.pill,
                                activeCategory === cat ? styles.pillActive : styles.pillInactive
                            ]}
                        >
                            <Text style={[
                                styles.pillText,
                                activeCategory === cat ? styles.pillTextActive : styles.pillTextInactive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                        
                    ))}
                </ScrollView>
            </View>

            {/* News Feed */}
            <ScrollView contentContainerStyle={styles.feedContainer}>
                {NEWS_ITEM.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <ImageBackground
                            source={{ uri: item.image }}
                            style={styles.cardImage}
                            imageStyle={{ borderRadius: 16 }}
                        >
                            {/* The Breaking Header for the news */}
                            <View style={styles.tagContainer}>
                                <Text style={styles.tagText}>{item.tag}</Text>
                            </View>

                            {/* The Gradiemt Fade for text at the bottom of the news image */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                style={styles.gradient}
                            >
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSource}>{item.source}</Text>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                ))}
                {/* Adding padding at the bottom */}
                <View style={{ height: 100 }}/>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: '#ECE0D1',
    },
    headerContainer: {
        //paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#ECE0D1',
        zIndex: 10, // keeps it on top
    },
    
    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        height: 45,
        borderRadius: 25, // Gives it the Round corner
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'System', 
        color: '#5C4033',
    },

    //The Filiter Pills
    pillsList: {
        paddingHorizontal: 20,
        paddingTop: 15,
        gap: 10, // The space between Pills
    },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#5c4033'
    },
    pillActive: {
        backgroundColor: '#5C4033',
    },
    pillInactive: {
        backgroundColor: 'transparent',
    },
    pillText: {
        fontWeight: '600',
        fontSize: 12,
    },
    pillTextActive: {
        color: '#FFF',
    },
    pillTextInactive: {
        color: '#5C4033'
    },

    // News Feed Styles
    feedContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 20,
    },
    card: {
        height: 250,
        borderRadius: 16,

        // Shadow for the news cards
        shadowColor: '#5C4033',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4},
        elevation: 5,
    },
    cardImage: {
        flex: 1,
        justifyContent: 'space-between', // Pushes content to top/bottom
        },

    //"Breaking" Tag
    tagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#5C4033',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
        marginTop: 15,
        marginLeft: 15,
    },
    tagText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },

    // Gradient and the Text Overlay
    gradient: {
        padding: 15,
        borderRadius: 16, // To match the card radius, if you change card radius change this radius as well
    },
    cardTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSource: {
        color: '#E0E0E0',
        fontSize: 12,
        fontStyle: 'italic',
    },

});