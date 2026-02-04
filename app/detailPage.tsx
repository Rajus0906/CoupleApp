import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Importing API Services
import { fetchCredits, fetchDetails, getImageUrl } from "@/services/tmdb";

const { width } = Dimensions.get('window');

export default function DetailScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();

  // Data State
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [cast, setCast] = React.useState<any[]>([]);

  // User Interaction State
  const [inPersonalList, setInPersonalList] = React.useState(false); //'Me' list
  const [inSharedList, setInSharedList] = React.useState(false);
  const [userRating, setUserRating] = React.useState(0);

  React.useEffect(() => {
    loadData();
  }, [id]); 

  //try     → do the risky thing
  //catch   → handle the failure
  //finally → clean up


  const loadData = async () => {
    setLoading(true);
    try {
      const [detailData, creditData] = await Promise.all([
        fetchDetails(Number(id), type as string),
        fetchCredits(Number(id), type as string)
      ]);

      if (detailData) setData(detailData);
      if (creditData && creditData.cast) setCast(creditData.cast);

    } catch (error) {
      console.error("Failed to load details", error)

    } finally {
    setLoading(false);
    };
  };

  const handleRating = (stars: number) => {
    setUserRating(userRating === stars ? 0 : stars);
  };

  // -- Helper: Extract US Age Rating --
  const getAgeRating = (item: any) => {
    if (!item) return null;

    // Check for TV Rating 
    if (item.content_rating && item.content_rating.results) {
      const usRating = item.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
      return usRating ? usRating.rating : null;
    }

    // Check for Movie Rating
    if (item.release_date && item.release_date.results) {
      const usDates = item.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
      if (usDates && usDates.release_date.length > 0) {
        // Find the first certification that isn't empty
        const cert = usDates.release_dates.find((d: any) => d.certification !== '');
        return cert ? cert.certification : null;
      }
    }
    return null;
  };

  const ageRating = getAgeRating(data);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#ECE0D1' />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Immersive Background */}
      <ImageBackground
      source={{ uri: getImageUrl(data?.poster_path) }}
      style={styles.backgroundImage}
      blurRadius={20}
      >
        <LinearGradient
          colors={['rgba(30,27,24,0.4)', '#1E1B18']}
          style={styles.gradientOverlay}
        />

        {/* HEADER BACK BUTTON */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#ECE0D1" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* FLOATING POSTER */}
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: getImageUrl(data?.poster_path) }}
              style={styles.posterImage}
            />
          </View>

          {/* INFO BLOCK */}
          <View style={styles.infoBlock}>
            <Text style={styles.title}>{data?.title || data?.name}</Text>

            <View style={styles.metaRow}>

              {/* Global Rating Score */}
              {data?.vote_average > 0 && (
                <>
                <View style={styles.scoreBadge}>
                  <Ionicons name="star" size={12} color="#1e1b18"/>
                  <Text style={styles.scoreText}>{data?.vote_average?.toFixed(1)}</Text>
                </View>
                <Text style={styles.dot}>•</Text>
                </>
              )}

              {/* Year Released */}
              <Text style={styles.metaText}>
                {data?.release_date?.split('-')[0] || data?.first_air_date?.split('-')[0]}
              </Text>

              {/* Age Released */}
              {ageRating && (
                <>
                <Text style={styles.dot}>•</Text>
                <View style={styles.ageRatingBadge}>
                  <Text style={styles.ageRatingText}>{ageRating}</Text>
                </View>
                </>
              )}

              <Text style={styles.dot}>•</Text>

              {/* Runtime / Seasons */}
              <Text style={styles.metaText}>
                {data?.number_of_seasons
                    ? `${data.number_of_seasons} Seasons${data.number_of_seasons > 1 ? 's' : ''}`
                    : data?.runtime
                        ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`
                        : 'N/A'
                
                }
              </Text>
            </View>

            {/* Genre */}
            <Text style={styles.genreText}>
              {data?.genres?.map((g: any) => g.name).slice(0, 3).join(', ')}
            </Text>
          </View>

          {/* Action Bar: Me \ Us \ Rating */}
          <View style={styles.actionBar}>
            
            {/* Personal List */}
            <TouchableOpacity
              style={[styles.iconButton, inPersonalList && styles.iconButtonActive]}
              onPress={() => setInPersonalList(!inPersonalList)}
            >
              <Ionicons
                name={inPersonalList ? "bookmark" : "bookmark-outline"}
                size={22}
                color={inPersonalList ? "#fff" : "#5c4033"}
                />
                <Text style={[styles.miniLabel, inPersonalList && styles.miniLabelActive]}>
                  Me
                </Text>
            </TouchableOpacity>

            {/* Shared List */}
            <TouchableOpacity
              style={[styles.iconButton, styles.sharedButton, inSharedList && styles.sharedButtonActive]}
              onPress={() => setInSharedList(!inSharedList)}
            >
              <Ionicons
                name={inSharedList ? "people" : "people-outline"}
                size={22}
                color={inSharedList ? "#ece0d1" : "#5c4033"}
                />
                <Text style={[styles.miniLabel, inSharedList && styles.miniLabelActive]}>
                  Us
                </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.verticalDivider} />


            {/* Your Rating */}
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                  <Ionicons
                    name={star <= userRating ? "star" : "star-outline"}
                    size={24}
                    color="#d4af37"
                    />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SYNOPSIS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overviewText}>
              {data?.overview || "No description available for this title."}
            </Text>
          </View>

          {/* CAST */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castList}>
              {cast.slice(0, 10).map((actor) => (
                <View key={actor.id} style={styles.castCard}>
                  <Image
                    source={{ uri: getImageUrl(actor.profile_path, 'w185') }}
                    style={styles.castImage}
                    />
                    <Text style={styles.castName} numberOfLines={2}>{actor.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* --- LEGAL FOOTER (Required by TMDB) --- */}
          <View style={styles.legalFooter}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/320px-Tmdb.new.logo.svg.png' }} 
              style={styles.tmdbLogo}
              resizeMode="contain"
            />
            <Text style={styles.legalText}>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
 }

 const styles = StyleSheet.create({

  //Basic Design
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '1E1B18'
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1B18'
  },
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Poster Visual Design
  posterContainer: {
    marginTop: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 15,
  },
  posterImage: {
    width: width * 0.6,
    aspectRatio: 2/3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Info Block Display
  infoBlock: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 25,
  },
  title: {
    color: '#ECE0D1',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaText: {
    color: '#ece0d1',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  genreText: {
    color: '#ECE0D1',
    fontSize: 13,
    marginTop: 8,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  dot: {
    color: '#D4AF37',
    marginHorizontal: 8,
    fontSize: 18,
  },

  // Metadata Design
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4af37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  scoreText: {
    color: '#1e1b1b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  ageRatingBadge: {
    borderWidth: 1,
    borderColor: '#ece0d1',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  ageRatingText: {
    color: '#ece0d1',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Action Bar design
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ece0d1',
    width: '90%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 35,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92,64,51,0.05)',
    width: 50,
    height: 50,
    borderRadius: 16,
  },
  iconButtonActive: {
    backgroundColor: '#5c4033',
  },
  sharedButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)', 
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginLeft: 10,
  },
  sharedButtonActive: {
    backgroundColor: '#8d6e63',
    borderColor: '#8d6e63',
  },
  miniLabel: {
    fontSize: 10,
    color: '#5c4033',
    fontWeight: 'bold',
    marginTop: 2,
  },
  miniLabelActive: {
    color: '#fff',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(92,64,51,0.15)',
    marginHorizontal: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },

  // Sections
  section: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 35,
  },
  sectionTitle: {
    color: '#ece0d1',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overviewText: {
    color: '#ece0d1',
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },

  // Cast
  castList: {
    marginTop: 5, 
  },
  castCard: {
    marginRight: 20,
    alignItems: 'center',
    width: 70,
  },
  castImage: {
    width: 70,
    height: 70,
    borderRadius: 35, 
    backgroundColor: '#2C2621',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', 
  },
  castName: {
    color: '#ECE0D1',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '500',
  },

  // LEGAL FOOTER
  legalFooter: {
    marginTop: 50,
    alignItems: 'center',
    opacity: 0.6,
    paddingHorizontal: 40
  },
  tmdbLogo: {
    width: 100,
    height: 40,
    marginBottom: 10
  },
  legalText: {
    color: '#ECE0D1',
    fontSize: 10,
    textAlign: 'center'
  }
 });


 