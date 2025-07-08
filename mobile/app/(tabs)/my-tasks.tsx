import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, View as RNView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getTasks, getProfile } from '../api';
import { useRouter } from 'expo-router';
import EmptyOrError from '@/components/EmptyOrError';

export default function MyTasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | number | null>(null);
  const router = useRouter();
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
      const data = await getTasks(token);
      const myTasks = (data.tasks || data || []).filter((t: any) => t.client_id === profile.id || t.client === profile.id || t.client_name === profile.name);
      setTasks(myTasks);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки задач');
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
          <Text style={styles.title} accentColor="violet">Мои задачи</Text>
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
          ) : tasks.length === 0 ? (
            <EmptyOrError
              icon="search-outline"
              title="Нет задач"
              description="Вы еще не создали ни одной задачи."
              actionText="Создать задачу"
              onAction={() => router.push('/create-task')}
              accent="teal"
            />
          ) : (
            tasks.map((task, i) => (
              <TouchableOpacity
                key={task.id || i}
                style={styles.taskCard}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Text style={styles.taskTitle} accentColor="teal">{task.title}</Text>
                <Text style={styles.taskDesc}>{task.description}</Text>
                <RNView style={styles.row}>
                  <Text style={styles.taskMeta}>AI-сложность: {task.ai_complexity ?? '-'}</Text>
                  <Text style={styles.taskMeta}>AI-цена: {task.ai_price_min ?? '-'}–{task.ai_price_max ?? '-'}</Text>
                  <Text style={styles.taskMeta}>Статус: {task.status ?? '-'}</Text>
                </RNView>
                <Text style={styles.taskMeta}>Исполнитель: {task.freelancer_name || task.freelancer || '-'}</Text>
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
  taskCard: {
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
  taskTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  taskDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  taskMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    marginRight: 8,
  },
}); 