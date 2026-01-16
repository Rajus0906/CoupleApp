import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { fetchTrending, getImageUrl, searchMulti } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'Games']


export default function SearchScreen() {
    const router = useRouter(); // For navigating to detail screen

    //UI states
    const [activeCategory, setActiveCategory] = React.useState('All');
    const [searchText, setSearchText] = React.useState('');

    // STATE for Data 
    const [newsData, setNewsData] = React.useState<any[]>([]);
    const [searchResults, setSearchResults] = React.useState<any[]>([]) // For a seperate list for search
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(1); // Tracks the current page
    const [refreshing, setRefreshing] = React.useState(false);

    // Load Initial 'News' (Trending)
    React.useEffect(() => {
        loadNews(1);
    }, []);

    const loadNews = async (pageNum: number, shouldRefresh: boolean = false) => {
        if (loading) return;
        setLoading(true);

        const data = await fetchTrending(pageNum);

        if (data && data.results) {
            if(shouldRefresh){
                setNewsData(data.results); // Replaces list if refreshing
            } else {
                setNewsData(prev => [...prev, ...data.results]);
            }
            setPage(pageNum);
        }
        setLoading(false);
        setRefreshing(false);
    };

    // This Code handles Searching
    const handleSearch = async (text: string) => {
        setSearchText(text);
        if (text.length > 2) {
            // Only start searching when they put more than 2 letters
            const data = await searchMulti(text);
            if (data && data.results) {
                setSearchResults(data.results);
            }
        } else {
            // If they erase it go back to the trending screen
            setSearchResults([]);
        }
    };

    // Clicking on the news to open it up
    const handleNewsClick = (itemId: number, type: string) => {
        // TMDB cant give us direct link click, so it will send them to the TMDB page
        const mediaType = type || 'movie';
        Linking.openURL(`https://www.themoviedb.org/${mediaType}/${itemId}`);
    };

    const handleSearchClick = (item: any) => {
        // Search Results open a detail screen to add to watch list
        router.push({
            pathname: "/profile",
            params: { id: item.id, type: item.media_type || 'movie'}
        });
    };

    // Render Items
    const renderNewsItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => handleNewsClick(item.id, item.media_type)}
        >
            <ImageBackground
                source={{ uri: getImageUrl(item.backdrop_path || item.poster_path) }}
                style={styles.cardImage}
                imageStyle={{ borderRadius: 16 }}
            >
                {item.vote_average > 7.5 && (
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>TRENDING</Text>
                    </View>
                )}

                <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
                >
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title || item.name}
                    </Text>
                    <Text style={styles.cardSource}>
                    Rating: {item.vote_average?.toFixed(1)} • {item.release_date || item.first_air_date}
                    </Text>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );

    const renderSearchItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => handleSearchClick(item)}
        >
            <Image
                source={{ uri: getImageUrl(item.poster_path, 'w92') }}
                style={styles.searchThumbnail}
            />
            <View style={styles.searchMeta}>
                <Text style={styles.searchTitle} numberOfLines={1}> {item.title || item.name}</Text>
                <Text style={styles.searchSubtitle}>
                {item.media_type === 'tv' ? 'TV Show' : 'Movie'} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#8d6e63'/>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

          {/* HEADER: Search Bar + Pills */}
          <View style={styles.headerContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#8D6E63" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Find movies, games..."
                placeholderTextColor="#8D6E63"
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearch}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchText(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={20} color="#8D6E63" />
                </TouchableOpacity>
              )}
            </View>
    
            {/* Categories (Only show if NOT searching) */}
            {searchText.length === 0 && (
              <View style={styles.pillsList}>
                 {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    style={[styles.pill, activeCategory === cat ? styles.pillActive : styles.pillInactive]}
                  >
                    <Text style={[styles.pillText, activeCategory === cat ? styles.pillTextActive : styles.pillTextInactive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
    
          {/* CONTENT AREA */}
          {searchText.length > 0 ? (
            // --- SEARCH RESULTS LIST (Goodreads Style) ---
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSearchItem}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          ) : (
            // --- NEWS FEED (Infinite Scroll) ---
            <FlatList
              data={newsData}
              keyExtractor={(item, index) => item.id.toString() + index} // Unique key fix
              renderItem={renderNewsItem}
              contentContainerStyle={styles.feedContainer}
              
              // Infinite Scroll Props
              onEndReached={() => loadNews(page + 1)} 
              onEndReachedThreshold={0.5} // Load when halfway down the last item
              
              // Pull to Refresh Props
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={() => { setRefreshing(true); loadNews(1, true); }}
                  tintColor="#5C4033" // Spinner color
                />
              }
              
              // Footer Loader
              ListFooterComponent={loading ? <ActivityIndicator size="small" color="#5C4033" /> : null}
            />
          )}
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

    //Search Drop Down Style Design
    searchResultsContainer: {
        flex: 1,
        backgroundColor: 'rgba(236, 224, 209, 0.95)',
        paddingHorizontal: 20,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        marginBottom: 10,

        //Shadow
        shadowColor: '#000',
        shadowOpacity: 0.05,
        elevation: 1,
    },
    searchThumbnail: {
        width: 50,
        height: 75,
        borderRadius: 8,
        backgroundColor: '#DDD',
    },
    searchMeta: {
        flex: 1,
        marginLeft: 15,
    },
    searchTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5c4033',
        marginBottom: 4,
    },
    searchSubtitle: {
        fontSize: 12,
        color: '#8d6e63',
    },
});