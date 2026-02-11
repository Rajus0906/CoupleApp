import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '@/utils/supabase';

export default function FriendSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Search Logic
  const handleSearch = async () => {
    if (query.trim().length === 0) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // A. Search Profiles (Limit 10)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('username', `%${query}%`)
      .neq('id', user.id) // Don't show myself
      .limit(10);

    if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
    }

    if (!profiles || profiles.length === 0) {
        setResults([]);
        setLoading(false);
        return;
    }

    // B. Check Friend Status for these users
    // We fetch ALL relationships involving YOU to see if these profiles are in there
    const { data: myRelationships } = await supabase
        .from('friends')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    // C. Merge Status into Results
    const resultsWithStatus = profiles.map(profile => {
        // Find if a row exists between Me and This Profile
        const rel = myRelationships?.find(r => 
            (r.sender_id === user.id && r.receiver_id === profile.id) || 
            (r.receiver_id === user.id && r.sender_id === profile.id)
        );

        let status = 'none'; // Default: Not friends
        
        if (rel) {
            if (rel.status === 'accepted') {
                status = 'accepted'; // Already Friends
            } else if (rel.sender_id === user.id) {
                status = 'sent'; // I sent request
            } else {
                status = 'received'; // They sent request
            }
        }
        
        return { ...profile, status };
    });

    setResults(resultsWithStatus);
    setLoading(false);
  };

  // 2. Add Friend Logic
  const handleAddFriend = async (receiverId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('friends')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending' 
      });

    if (error) {
        Alert.alert('Error', error.message);
    } else {
        // Update UI immediately to show "Sent"
        setResults(prev => prev.map(item => 
            item.id === receiverId ? { ...item, status: 'sent' } : item
        ));
    }
  };

  // 3. Render Button Based on Status
  const renderActionButton = (item: any) => {
    switch (item.status) {
        case 'accepted':
            return (
                <View style={[styles.addButton, styles.disabledButton]}>
                    <Text style={styles.disabledText}>Added</Text>
                </View>
            );
        case 'sent':
            return (
                <View style={[styles.addButton, styles.disabledButton]}>
                    <Text style={styles.disabledText}>Sent</Text>
                </View>
            );
        case 'received':
            return (
                <TouchableOpacity 
                    style={[styles.addButton, {backgroundColor: '#2E7D32'}]} 
                    onPress={() => Alert.alert("Go to Requests", "Go to your main Friends list to accept this request.")}
                >
                    <Text style={styles.addButtonText}>Accept</Text>
                </TouchableOpacity>
            );
        default:
            return (
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(item.id)}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#5C4033" />
        </TouchableOpacity>
        <Text style={styles.title}>Find Friends</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8D6E63" style={{marginRight: 10}} />
        <TextInput 
          style={styles.input}
          placeholder="Search by username..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Results List */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} color="#5C4033" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Image 
                source={{ uri: item.avatar_url || 'https://reactnative.dev/img/tiny_logo.png' }} 
                style={styles.avatar} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                {item.full_name ? <Text style={styles.fullName}>{item.full_name}</Text> : null}
              </View>
              
              {/* RENDER THE DYNAMIC BUTTON */}
              {renderActionButton(item)}
            </View>
          )}
          ListEmptyComponent={
            query.length > 0 && !loading ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ece0d1', paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#5C4033' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, fontSize: 16, color: '#5C4033' },
  list: { flex: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF6F1', padding: 15, borderRadius: 12, marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#CCC' },
  userInfo: { flex: 1, marginLeft: 15 },
  username: { fontSize: 16, fontWeight: 'bold', color: '#5C4033' },
  fullName: { fontSize: 14, color: '#8D6E63' },
  
  // Button Styles
  addButton: { backgroundColor: '#5C4033', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minWidth: 70, alignItems: 'center' },
  addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  
  // Disabled (Grey) Styles
  disabledButton: { backgroundColor: '#D7CCC8' }, // Light Grey/Brown
  disabledText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  emptyText: { textAlign: 'center', color: '#8D6E63', marginTop: 20 }
});