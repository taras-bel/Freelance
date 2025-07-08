import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getReviews, addReview } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getReviews(token);
      setReviews(data.reviews || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await addReview(token, 'me', { text, rating });
      setText('');
      setRating(5);
      fetchData();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка отправки отзыва');
    } finally {
      setSubmitting(false);
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.outer} keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title} accentColor="violet">Отзывы</Text>
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
                description="Будьте первым, кто оставит отзыв!"
                accent="teal"
              />
            ) : (
              <>
                {reviews.map((rev, i) => (
                  <View key={rev.id || i} style={styles.revCard} glass>
                    <Text style={styles.revUser} accentColor="cyan">{rev.user_name || rev.user || 'Пользователь'}</Text>
                    <Text style={styles.revText}>{rev.text}</Text>
                    <Text style={styles.revRating}>Оценка: {rev.rating ?? '-'}</Text>
                    <Text style={styles.revDate}>{rev.date || rev.created_at}</Text>
                  </View>
                ))}
                <Text style={styles.formTitle} accentColor="teal">Оставить отзыв</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ваш отзыв..."
                  placeholderTextColor="#b0b8d1"
                  value={text}
                  onChangeText={setText}
                  multiline
                  editable={!submitting}
                />
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Оценка:</Text>
                  {[1,2,3,4,5].map((r) => (
                    <TouchableOpacity key={r} onPress={() => setRating(r)} disabled={submitting}>
                      <Text style={[styles.ratingStar, rating >= r && styles.ratingStarActive]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting || !text.trim()}>
                  <Text style={styles.submitBtnText}>{submitting ? 'Отправка...' : 'Отправить'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  revUser: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  revText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  revRating: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#00e1ff',
    marginBottom: 2,
  },
  revDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    textAlign: 'right',
  },
  formTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    width: 260,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginRight: 8,
  },
  ratingStar: {
    fontSize: 22,
    color: '#b0b8d1',
    marginHorizontal: 2,
  },
  ratingStarActive: {
    color: '#00e1ff',
    textShadowColor: '#00e1ff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  submitBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  submitBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
}); 