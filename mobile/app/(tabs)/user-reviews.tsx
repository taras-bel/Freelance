import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, View as RNView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getReviews, getProfile } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function UserReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const profile = await getProfile(token);
      setUserId(profile.id);
      const data = await getReviews(token, profile.id);
      setReviews(data.reviews || data || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.outer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00e1ff", "#a259ff"]}
            tintColor="#00e1ff"
          />
        }
      >
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Отзывы обо мне</Text>
          {loading ? (
            <ActivityIndicator color="#00e1ff" />
          ) : error ? (
            <EmptyOrError
              icon="alert-circle-outline"
              title="Ошибка"
              description={error}
              actionText="Повторить"
              onAction={fetchData}
              accent="violet"
            />
          ) : reviews.length === 0 ? (
            <EmptyOrError
              icon="chatbubble-ellipses-outline"
              title="Нет отзывов"
              description="О вас еще не оставили отзывов."
              accent="teal"
            />
          ) : reviews.map((rev, i) => (
            <View key={rev.id || i} style={styles.revCard} glass>
              <RNView style={styles.revHeader}>
                <Text style={styles.revAuthor} accentColor="teal">{rev.author_name || rev.author || 'Пользователь'}</Text>
                <Text style={styles.revRating}>★ {rev.rating ?? '-'}</Text>
              </RNView>
              <Text style={styles.revText}>{rev.text}</Text>
              <Text style={styles.revDate}>{rev.date || rev.created_at}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181820',
    paddingVertical: 32,
  },
  glassPanel: {
    padding: 32,
    minWidth: 320,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 16,
  },
  revCard: {
    width: 260,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  revAuthor: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
  },
  revRating: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#00e1ff',
  },
  revText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  revDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    textAlign: 'right',
  },
}); 