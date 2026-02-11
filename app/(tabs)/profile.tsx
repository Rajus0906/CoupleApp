import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { supabase } from '@/utils/supabase';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [session, setSession] = useState<any>(null);
    
    // Profile Data
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('https://reactnative.dev/img/tiny_logo.png');

    // Stats
    const [ratingCount, setRatingCount] = useState(0);
    const [friendCount, setFriendCount] = useState(0);

    // Settings Modal State
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false); 

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                router.replace('/'); 
                return;
            }
            setSession(session);

            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('username, bio, full_name, avatar_url')
                .eq('id', session.user.id)
                .single();

            const meta = session.user.user_metadata;
            
            if (data?.username) setUsername(data.username);
            else if (meta?.username) setUsername(meta.username);
            
            if (data?.full_name) setFullName(data.full_name);
            else if (meta?.full_name) setFullName(meta.full_name);

            if (data?.bio) setBio(data.bio);
            else if (meta?.bio) setBio(meta.bio);

            if (data?.avatar_url) setAvatarUrl(data.avatar_url);

            // B. Fetch Rating Count
            const { count: reviewCount } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true }) 
                .eq('user_id', session.user.id);
            
            if (reviewCount !== null) setRatingCount(reviewCount);

            // C. FETCH REAL FRIEND COUNT
            const { count: friendsAsSender } = await supabase
                .from('friends')
                .select('*', { count: 'exact', head: true })
                .eq('sender_id', session.user.id)
                .eq('status', 'accepted');

            const { count: friendsAsReceiver } = await supabase
                .from('friends')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', session.user.id)
                .eq('status', 'accepted');
            
            const totalFriends = (friendsAsSender || 0) + (friendsAsReceiver || 0);
            setFriendCount(totalFriends); 

        } catch (error) {
            console.log("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    }

    // --- UPLOAD PROFILE PICTURE ---
    const uploadAvatar = async () => {
        try {
            setUploading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], 
                quality: 0.5,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                setUploading(false);
                return;
            }

            const image = result.assets[0];
            if (!session?.user) throw new Error("No user found");

            const response = await fetch(image.uri);
            const arrayBuffer = await response.arrayBuffer();
            const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
            const path = `${session.user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, arrayBuffer, {
                    contentType: image.mimeType ?? 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(path);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            Alert.alert("Success", "Profile picture updated!");

        } catch (error) {
            if (error instanceof Error) Alert.alert("Upload Failed", error.message);
        } finally {
            setUploading(false);
        }
    };

    // --- UPDATE PROFILE (TEXT) ---
    async function updateProfile() {
        try {
            setLoading(true);
            const updates = {
                id: session?.user.id,
                username,
                bio,
                full_name: fullName,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            Alert.alert("Success", "Profile updated!");
            setIsEditing(false); 
            setSettingsVisible(false); 
            getProfile(); 

        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        } finally {
            setLoading(false);
        }
    }

    // --- SIGN OUT ---
    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace('/login'); 
    }

    // --- PLACEHOLDER WATCHLIST ---
    const myWatchlist = [
        { id: 1, title: "Transformers", rating: 5, poster: "https://image.tmdb.org/t/p/w500/6KEryM3Rm0L8qJ7d50k3X9XkX3.jpg" },
        { id: 2, title: "Endgame", rating: 5, poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
        { id: 3, title: "Spider-Man 3", rating: 4, poster: "https://image.tmdb.org/t/p/w500/qFmwhVUoUSXjkKRmca5yGDxz88K.jpg" },
    ];

    if (loading && !session) {
        return <View style={styles.loadingContainer}><ActivityIndicator color="#5C4033" /></View>;
    }

    return (
      <View style={{flex: 1}}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>

            {/* -- HEADER SECTION -- */}
            <View style={styles.headerContainer}>
                <View style={styles.profileImageWrapper}>
                    {uploading ? (
                        <View style={[styles.profilePic, {justifyContent: 'center', alignItems: 'center'}]}>
                            <ActivityIndicator color="#5C4033" />
                        </View>
                    ) : (
                        <Image source={{ uri: avatarUrl }} style={styles.profilePic} />
                    )}
                    <TouchableOpacity style={styles.editBtn} onPress={uploadAvatar} disabled={uploading}>
                        <Ionicons name="camera" size={14} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userBioText}>{bio ? bio : "No bio yet."}</Text>
            </View>

            {/* -- FRIEND SEARCH BUTTON (Top Left) -- */}
            <TouchableOpacity 
                style={styles.friendSearchIcon} 
                onPress={() => router.push('/friendSearch')} 
            >
                <Ionicons name="person-add-outline" size={26} color="#5C4033" />
            </TouchableOpacity>

            {/* -- SETTINGS BUTTON (Top Right) -- */}
            <TouchableOpacity 
                style={styles.settingsIcon} 
                onPress={() => {
                    setSettingsVisible(true);
                    setIsEditing(false); 
                }}
            >
                <Ionicons name="settings-outline" size={26} color="#5C4033" />
            </TouchableOpacity>

            {/* -- STATS SECTION -- */}
            <View style={styles.statsContainer}>
                {/* --- CHANGED THIS LINK TO /friendsList --- */}
                <TouchableOpacity 
                    style={styles.statBox} 
                    onPress={() => router.push('/friendsList')}
                >
                    <Text style={styles.statNumber}> {friendCount} </Text>
                    <Text style={styles.statLabel}> Friends </Text>
                </TouchableOpacity>

                <View style={styles.verticalDivider}/>

                <View style={styles.statBox}>
                    <Text style={styles.statNumber}> {ratingCount} </Text>
                    <Text style={styles.statLabel}> Rated </Text>
                </View>
            </View>

            {/* -- ACHIEVEMENTS -- */}
            <Text style={styles.sectionHeader}>Achievements</Text>
            <View style={styles.achievementsContainer}>
                <View style={styles.achievementBox}>
                    <View style={[styles.circleBadge, { backgroundColor: '#C0C0C0' }]} /> 
                    <Text style={styles.achievementText}>Binge Watcher</Text>
                </View>
                <View style={styles.achievementBox}>
                    <View style={[styles.circleBadge, { backgroundColor: '#FFD700' }]} /> 
                    <Text style={styles.achievementText}>Gamer</Text>
                </View>
                <View style={styles.achievementBox}>
                    <View style={[styles.circleBadge, { backgroundColor: '#CD7F32' }]} /> 
                    <Text style={styles.achievementText}>Romantic</Text>
                </View>
            </View>

            {/* -- PRIVATE WATCHLIST -- */}
            <Text style={styles.sectionHeader}>Top Rated</Text>
            <View style={styles.gridContainer}>
                {myWatchlist.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Image source={{ uri: item.poster }} style={styles.cardImage} />
                        <View style={styles.cardFooter}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={styles.starRow}>
                                {[...Array(item.rating)].map((_, i) => (
                                    <Ionicons key={i} name="star" size={10} color="#5C4033" />
                                ))}
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={{height: 100}} /> 
        </ScrollView>

        {/* --- SETTINGS MODAL --- */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={settingsVisible}
            onRequestClose={() => setSettingsVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.dragHandle} />
                    {!isEditing ? (
                        <>
                            <Text style={styles.modalTitle}>Settings</Text>
                            <TouchableOpacity style={styles.modalOption} onPress={() => setIsEditing(true)}>
                                <Ionicons name="person-circle-outline" size={24} color="#5C4033" />
                                <Text style={styles.modalOptionText}>Edit Profile</Text>
                                <Ionicons name="chevron-forward" size={20} color="#8D6E63" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalOption} onPress={() => Alert.alert("Coming Soon", "Privacy settings not implemented yet.")}>
                                <Ionicons name="lock-closed-outline" size={24} color="#5C4033" />
                                <Text style={styles.modalOptionText}>Privacy</Text>
                                <Ionicons name="chevron-forward" size={20} color="#8D6E63" />
                            </TouchableOpacity>
                            <View style={styles.modalDivider} />
                            <TouchableOpacity style={styles.modalOption} onPress={handleSignOut}>
                                <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
                                <Text style={[styles.modalOptionText, {color: '#D32F2F'}]}>Sign Out</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setSettingsVisible(false)}>
                                <Text style={styles.cancelButtonText}>Close</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.modalHeaderRow}>
                                <TouchableOpacity onPress={() => setIsEditing(false)}>
                                    <Ionicons name="arrow-back" size={24} color="#5C4033" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Edit Profile</Text>
                                <View style={{width: 24}} /> 
                            </View>
                            <Text style={styles.inputLabel}>Username</Text>
                            <TextInput style={styles.modalInput} value={username} onChangeText={setUsername} autoCapitalize="none" />
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput style={styles.modalInput} value={fullName} onChangeText={setFullName} />
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput style={[styles.modalInput, {height: 80, textAlignVertical: 'top'}]} value={bio} onChangeText={setBio} multiline />
                            <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
      </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ece0d1' },
    scrollContainer: { flex: 1, backgroundColor: '#ece0d1' },
    contentContainer: { alignItems: "center", paddingTop: 20, paddingBottom: 40 },
    headerContainer: { alignItems: 'center', marginBottom: 20 },
    profileImageWrapper: { position: 'relative' },
    profilePic: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#FFF', backgroundColor: '#ccc' },
    editBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#5C4033', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ece0d1' },
    userBioText: { color: '#8D6E63', fontSize: 14, marginTop: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 40 },
    settingsIcon: { position: 'absolute', top: 10, right: 20, zIndex: 10 },
    friendSearchIcon: { position: 'absolute', top: 10, left: 20, zIndex: 10 },
    statsContainer: { flexDirection: 'row', backgroundColor: '#fff', width: '90%', paddingVertical: 15, borderRadius: 20, justifyContent: 'space-evenly', alignItems: 'center', shadowColor: '#5C4033', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 30 },
    statBox: { alignItems: 'center', width: '40%' },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: '#5C4033' },
    statLabel: { fontSize: 10, color: '#8D6E63', marginTop: 2, textTransform: 'uppercase', fontWeight: 'bold' },
    verticalDivider: { width: 1, height: 30, backgroundColor: '#E0E0E0' },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#5C4033', marginBottom: 15, fontFamily: 'serif' },
    achievementsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginBottom: 30 },
    achievementBox: { width: '30%', aspectRatio: 1, backgroundColor: '#f2dcdb', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    circleBadge: { width: 30, height: 30, borderRadius: 15, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    achievementText: { fontSize: 11, fontWeight: 'bold', color: '#5C4033', textAlign: 'center' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '90%' },
    card: { width: '31%', marginBottom: 15, backgroundColor: '#f2dcdb', borderRadius: 10, padding: 5, alignItems: 'center' },
    cardImage: { width: '100%', aspectRatio: 2/3, borderRadius: 8, marginBottom: 5 },
    cardFooter: { alignItems: 'center', paddingBottom: 5 },
    cardTitle: { fontSize: 10, fontWeight: 'bold', color: '#5C4033', textAlign: 'center', marginBottom: 2 },
    starRow: { flexDirection: 'row' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { backgroundColor: '#FAF6F1', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 350, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
    dragHandle: { width: 40, height: 5, backgroundColor: '#D7CCC8', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#5C4033', marginBottom: 20, textAlign: 'center' },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EFEBE9' },
    modalOptionText: { flex: 1, fontSize: 16, color: '#5C4033', marginLeft: 15, fontWeight: '500' },
    modalDivider: { height: 20 },
    cancelButton: { marginTop: 20, alignItems: 'center', padding: 15 },
    cancelButtonText: { color: '#8D6E63', fontSize: 16, fontWeight: 'bold' },
    modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    inputLabel: { fontSize: 12, color: '#8D6E63', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
    modalInput: { backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#D7CCC8', padding: 12, fontSize: 16, color: '#5C4033', marginBottom: 15 },
    saveButton: { backgroundColor: '#5C4033', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});