import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '@/utils/supabase';

export default function FriendsListScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh data whenever we come back to this screen
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Check for Pending Requests (For the red badge)
    const { count } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    
    setPendingCount(count || 0);

    // 2. Fetch Accepted Friends
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        sender:sender_id(id, username, full_name, avatar_url),
        receiver:receiver_id(id, username, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (!error && data) {
        // Transform data
        // We type 'item' as 'any' to fix the TypeScript error you saw.
        const formatted = data.map((item: any) => {
            // Safety Check: Supabase sometimes returns single objects as arrays.
            // This grabs the first item if it is an array, or the item itself if it's an object.
            const senderData = Array.isArray(item.sender) ? item.sender[0] : item.sender;
            const receiverData = Array.isArray(item.receiver) ? item.receiver[0] : item.receiver;

            const isSender = senderData.id === user.id;
            
            return {
                id: item.id,
                // If I am sender, show receiver. If I am receiver, show sender.
                profile: isSender ? receiverData : senderData
            };
        });
        setFriends(formatted);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#5C4033" />
        </TouchableOpacity>
        <Text style={styles.title}>My Friends</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* --- THE REQUEST BUTTON (Top) --- */}
      <TouchableOpacity 
        style={styles.requestButton} 
        onPress={() => router.push('/friendRequest')} // Links to the request page
      >
        <View style={styles.reqRow}>
            <View style={styles.iconBg}>
                <Ionicons name="people" size={20} color="#5C4033" />
            </View>
            <Text style={styles.requestText}>Friend Requests</Text>
        </View>
        
        {/* Red Notification Badge */}
        {pendingCount > 0 ? (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
        ) : (
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>All Friends ({friends.length})</Text>

      {/* Friends List */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} color="#5C4033" />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{paddingBottom: 20}}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't added anyone yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
                <Image 
                  source={{ uri: item.profile.avatar_url || 'https://reactnative.dev/img/tiny_logo.png' }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.username}>{item.profile.username}</Text>
                  {item.profile.full_name ? <Text style={styles.subtext}>{item.profile.full_name}</Text> : null}
                </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ece0d1', paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#5C4033' },
  
  // Request Button Styles
  requestButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  reqRow: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2EBE0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  requestText: { fontSize: 16, fontWeight: '600', color: '#5C4033' },
  badge: { backgroundColor: '#D32F2F', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#5C4033', marginBottom: 15 },
  
  // List Styles
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF6F1', padding: 12, borderRadius: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#CCC', marginRight: 12 },
  username: { fontSize: 16, fontWeight: 'bold', color: '#5C4033' },
  subtext: { fontSize: 12, color: '#8D6E63' },
  emptyText: { textAlign: 'center', color: '#8D6E63', marginTop: 40, fontStyle: 'italic' }
});