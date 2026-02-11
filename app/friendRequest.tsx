import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function FriendRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  // 1. Fetch Pending Requests
  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get requests where YOU are the receiver AND status is 'pending'
    // We also fetch the sender's profile details (username, avatar)
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        sender:sender_id (id, username, full_name, avatar_url)
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (error) Alert.alert('Error', error.message);
    else setRequests(data || []);
    
    setLoading(false);
  };

  // 2. Accept Request Logic
  const handleAccept = async (friendshipId: number) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Remove from list instantly for snappy UI
      setRequests(prev => prev.filter(req => req.id !== friendshipId));
      Alert.alert('Success', 'Friend request accepted!');
    }
  };

  // 3. Reject Request Logic (Optional)
  const handleReject = async (friendshipId: number) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId);

    if (error) Alert.alert('Error', error.message);
    else setRequests(prev => prev.filter(req => req.id !== friendshipId));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#5C4033" />
        </TouchableOpacity>
        <Text style={styles.title}>Friend Requests</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} color="#5C4033" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{paddingBottom: 20}}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending requests.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: item.sender.avatar_url || 'https://reactnative.dev/img/tiny_logo.png' }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.username}>{item.sender.username}</Text>
                  <Text style={styles.subtext}>wants to be friends</Text>
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.button, styles.rejectButton]} 
                  onPress={() => handleReject(item.id)}
                >
                  <Ionicons name="close" size={20} color="#D32F2F" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.button, styles.acceptButton]} 
                  onPress={() => handleAccept(item.id)}
                >
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                </TouchableOpacity>
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
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAF6F1', padding: 15, borderRadius: 12, marginBottom: 10 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC', marginRight: 10 },
  username: { fontSize: 16, fontWeight: 'bold', color: '#5C4033' },
  subtext: { fontSize: 12, color: '#8D6E63' },
  actions: { flexDirection: 'row', gap: 10 },
  button: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  acceptButton: { backgroundColor: '#5C4033' },
  rejectButton: { backgroundColor: '#F8D7DA', borderWidth: 1, borderColor: '#D32F2F' },
  emptyText: { textAlign: 'center', color: '#8D6E63', marginTop: 50, fontStyle: 'italic' }
});