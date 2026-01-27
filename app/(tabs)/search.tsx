//DONT CONTINUE UNTIL SEARCH IS FIXED AND UNDERSTOOD

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

// Calls on TMDB Api
import { fetchTrending, getImageUrl, searchMulti } from '../../services/tmdb';

const CATEGORIES = ['All', 'Movies', 'TV Shows', 'Games'];

export default function SearchScreen() {
  const router = useRouter(); // For navigating to Detail Screen
  
  // UI State
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [searchText, setSearchText] = React.useState('');
  
  // Data State
  const [newsFeed, setNewsFeed] = React.useState<any[]>([]); 
  const [searchResults, setSearchResults] = React.useState<any[]>([]); // Seperate list for search
  const [page, setPage] = React.useState(1); // Track current page
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Initial Load
  React.useEffect(() => {
    loadNews(1);
  }, []);

  // Fetch News (Trending)
  const loadNews = async (pageNum: number, shouldRefresh: boolean = false) => {
    if (loading) return;
    setLoading(true);
    
    const data = await fetchTrending(pageNum);
    
    if (data && data.results) {
      if (shouldRefresh) {
        setNewsFeed(data.results); // Replace list if refreshing
      } else {
        setNewsFeed(prev => [...prev, ...data.results]); // Add to bottom if scrolling
      }
      setPage(pageNum);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Handle Search 
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length > 2) {
      const data = await searchMulti(text);
      if (data && data.results) {
        setSearchResults(data.results);
      }
    } else {
      setSearchResults([]); // Clear results if text is short
    }
  };

  //  Navigation Logic
  const handleNewsClick = (itemId: number, type: string) => {
    // News -> Open TMDB Website 
    const mediaType = type || 'movie';
    Linking.openURL(`https://www.themoviedb.org/${mediaType}/${itemId}`);
  };

  const handleSearchClick = (item: any) => {
    //When you click on a search it takes you to a new page that talks more about the movie
    router.push({
      pathname: "/detailPage",
      params: { id: item.id, type: item.media_type || 'movie' }
    });
    
  };

  // Render news card
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

        {/* Handles the Gradient on the News Card */}
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
        <Text style={styles.searchTitle} numberOfLines={1}>{item.title || item.name}</Text>
        <Text style={styles.searchSubtitle}>
          {item.media_type === 'tv' ? 'TV Show' : 'Movie'} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8D6E63" />
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
        // --- SEARCH RESULTS LIST  ---
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSearchItem}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        </View>
      ) : (
        // --- NEWS FEED (Infinite Scroll) ---
        <FlatList
          data={newsFeed}
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
                
                // For iOS (The Spinner Color)
                tintColor="#5C4033"
                
                // For Android (The Spinner Color - MUST be an array)
                colors={['#5C4033']} 
                
                // For Android (The background circle color - optional, matches your beige)
                progressBackgroundColor="#ECE0D1"
            />
          }
          
          // Footer Loader
          ListFooterComponent={loading ? <ActivityIndicator size="small" color="#5C4033" /> : null}

          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE0D1',
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#ECE0D1',
    zIndex: 10,
  },
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: '#5C4033',
    height: '100%',
  },
  
  // Pills
  pillsList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 10,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5C4033',
  },
  pillActive: { backgroundColor: '#5C4033' },
  pillInactive: { backgroundColor: 'transparent' },
  pillText: { fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFF' },
  pillTextInactive: { color: '#5C4033' },

  // --- NEWS FEED STYLES ---
  feedContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 100, // Space for bottom tab bar
    gap: 20,
  },
  card: {
    height: 250,
    marginBottom: 20, // Add explicit margin between cards
    borderRadius: 16,
    shadowColor: '#5C4033',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end', // <--- FIXES THE GLITCH (Pushes text to bottom)
  },
  tagContainer: {
    position: 'absolute', // Make this absolute so it doesn't mess with flex layout
    top: 15,
    left: 15,
    backgroundColor: '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  gradient: {
    padding: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  cardSource: { color: '#E0E0E0', fontSize: 12, fontWeight: '500' },

  // --- SEARCH DROPDOWN STYLES ---
  searchResultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(236, 224, 209, 0.95)', 
    paddingHorizontal: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
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
    color: '#5C4033',
    marginBottom: 4,
  },
  searchSubtitle: {
    fontSize: 12,
    color: '#8D6E63',
  },
});