import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getChats } from '../api';
import { useRouter } from 'expo-router';
import EmptyOrError from '@/components/EmptyOrError';

export default function ChatsScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getChats(token);
      setChats(data.chats || data || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки чатов');
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
          <Text style={styles.title} accentColor="violet">Чаты</Text>
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
          ) : chats.length === 0 ? (
            <EmptyOrError
              icon="chatbubble-ellipses-outline"
              title="Нет чатов"
              description="Пока у вас нет чатов. Начните диалог, откликнувшись на задачу!"
              accent="teal"
            />
          ) : (
            chats.map((chat, i) => (
              <TouchableOpacity
                key={chat.id || i}
                style={[styles.chatCard, !chat.read && styles.unreadCard]}
                onPress={() => router.push(`/chat/${chat.id}`)}
              >
                <Text style={styles.chatTitle} accentColor={!chat.read ? 'teal' : undefined}>{chat.title || chat.name || 'Чат'}</Text>
                <Text style={styles.lastMsg}>{chat.last_message?.text || 'Нет сообщений'}</Text>
                <Text style={styles.lastMsgDate}>{chat.last_message?.date || chat.last_message?.created_at}</Text>
                {!chat.read && <Text style={styles.unreadDot}>●</Text>}
              </TouchableOpacity>
            ))
          )}
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
  chatCard: {
    width: 260,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: 'rgba(0,225,255,0.12)',
  },
  chatTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  lastMsg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  lastMsgDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    textAlign: 'right',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 18,
    color: '#00e1ff',
  },
}); 