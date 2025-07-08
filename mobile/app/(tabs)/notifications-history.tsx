import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getNotifications } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function NotificationsHistoryScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getNotifications(token);
      setNotifications(data.notifications || data || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки уведомлений');
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
          <Text style={styles.title} accentColor="violet">История уведомлений</Text>
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
          ) : notifications.length === 0 ? (
            <EmptyOrError
              icon="notifications-outline"
              title="Нет уведомлений"
              description="Пока нет уведомлений в истории."
              accent="teal"
            />
          ) : notifications.map((n, i) => (
            <View key={n.id || i} style={[styles.notifCard, n.read && styles.notifRead]} glass>
              <Text style={styles.notifTitle} accentColor={n.read ? undefined : 'teal'}>{n.title}</Text>
              <Text style={styles.notifText}>{n.body}</Text>
              <Text style={styles.notifDate}>{n.date || n.created_at}</Text>
              <Text style={styles.notifStatus}>{n.read ? 'Прочитано' : 'Не прочитано'}</Text>
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
  notifCard: {
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
  notifRead: {
    backgroundColor: 'rgba(0,225,255,0.08)',
    opacity: 0.7,
  },
  notifTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notifText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  notifDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    textAlign: 'right',
  },
  notifStatus: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#00e1ff',
    textAlign: 'right',
    marginTop: 2,
  },
}); 